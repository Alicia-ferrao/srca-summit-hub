import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, FileText, X, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { comunicacaoSchema, type ComunicacaoForm, businessValidations } from "@/services/validationServices";
import { participantesService, comunicacoesService, emailService } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

export default function SubmitPaper() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { refreshStats } = useApp();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ComunicacaoForm>({
    resolver: zodResolver(comunicacaoSchema),
  });

  const emailValue = watch("participanteEmail");

  // Verificar tipo de inscrição quando o email é alterado
  useEffect(() => {
    const checkEmailType = async () => {
      if (!emailValue || !emailValue.includes("@")) {
        setEmailWarning(null);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const participante = await participantesService.getByEmail(emailValue);

        if (!participante) {
          setEmailWarning("Email não encontrado. Por favor registe-se primeiro.");
        } else if (!businessValidations.canSubmitComunicacao(participante.tipoInscricao || "")) {
          setEmailWarning(
            `Atenção: Apenas investigadores podem submeter comunicações. O seu tipo de inscrição é "${participante.tipoInscricao}".`
          );
        } else {
          setEmailWarning(null);
        }
      } catch (error) {
        console.error("Erro ao verificar email:", error);
        setEmailWarning(null);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmailType, 500);
    return () => clearTimeout(timeoutId);
  }, [emailValue]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const errorMessage = businessValidations.getFileErrorMessage(file);
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
      setSelectedFile(file);
      toast.success("Ficheiro selecionado com sucesso");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const removeFile = () => {
    setSelectedFile(null);
    toast.info("Ficheiro removido");
  };

  const onSubmit = async (data: ComunicacaoForm) => {
    if (!selectedFile) {
      toast.error("Por favor selecione um ficheiro PDF");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Verificar se o participante existe e é investigador
      const participante = await participantesService.getByEmail(data.participanteEmail);

      if (!participante) {
        toast.error("Participante não encontrado. Por favor registe-se primeiro.");
        return;
      }

      if (!businessValidations.canSubmitComunicacao(participante.tipoInscricao || "")) {
        toast.error("Apenas investigadores podem submeter comunicações");
        return;
      }

      setUploadProgress(20);

      // Upload do ficheiro
      const fileData = await comunicacoesService.uploadFile(selectedFile, setUploadProgress);

      // Criar registo da comunicação
      const comunicacao = await comunicacoesService.create({
        titulo: data.titulo,
        resumo: data.resumo,
        autores: data.autores,
        areaTematica: data.areaTematica,
        participanteId: participante.id,
        ficheiroUrl: fileData.url,
        ficheiroNome: fileData.name,
        ficheiroTipo: fileData.type,
        ficheiroTamanho: fileData.size,
      });

      // Enviar email de confirmação
      await emailService.sendConfirmation("comunicacao", {
        titulo: data.titulo,
        autores: data.autores,
        participanteEmail: data.participanteEmail,
      });

      toast.success("Comunicação submetida com sucesso!", {
        description: "Receberá um email de confirmação em breve.",
      });

      await refreshStats();
      navigate(`/success/paper?id=${comunicacao.id}`);
    } catch (error) {
      console.error("Erro ao submeter comunicação:", error);
      toast.error("Erro ao processar a submissão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="border-border shadow-xl animate-fade-in-up">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Submeter Comunicação</CardTitle>
                <CardDescription>Envie a sua proposta de comunicação científica</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Título da sua comunicação"
                  {...register("titulo")}
                  className={errors.titulo ? "border-destructive" : ""}
                />
                {errors.titulo && (
                  <p className="text-sm text-destructive">{errors.titulo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo *</Label>
                <Textarea
                  id="resumo"
                  placeholder="Resumo da sua comunicação (50-2000 caracteres)"
                  rows={6}
                  {...register("resumo")}
                  className={errors.resumo ? "border-destructive" : ""}
                />
                {errors.resumo && (
                  <p className="text-sm text-destructive">{errors.resumo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="autores">Autores *</Label>
                <Input
                  id="autores"
                  placeholder="Nome dos autores (separados por vírgula)"
                  {...register("autores")}
                  className={errors.autores ? "border-destructive" : ""}
                />
                {errors.autores && (
                  <p className="text-sm text-destructive">{errors.autores.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaTematica">Área Temática *</Label>
                <Input
                  id="areaTematica"
                  placeholder="Ex: Inteligência Artificial"
                  {...register("areaTematica")}
                  className={errors.areaTematica ? "border-destructive" : ""}
                />
                {errors.areaTematica && (
                  <p className="text-sm text-destructive">{errors.areaTematica.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="participanteEmail">Email do Participante *</Label>
                <Input
                  id="participanteEmail"
                  type="email"
                  placeholder="Email usado no registo"
                  {...register("participanteEmail")}
                  className={errors.participanteEmail ? "border-destructive" : ""}
                />
                {errors.participanteEmail && (
                  <p className="text-sm text-destructive">{errors.participanteEmail.message}</p>
                )}
                {isCheckingEmail && (
                  <p className="text-sm text-muted-foreground">A verificar...</p>
                )}
                {emailWarning && !isCheckingEmail && (
                  <Alert variant={emailWarning.includes("Atenção") ? "default" : "destructive"} className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Aviso</AlertTitle>
                    <AlertDescription>{emailWarning}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ficheiro PDF *</Label>
                {!selectedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Solte o ficheiro aqui..."
                        : "Arraste um ficheiro PDF ou clique para selecionar"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Máximo 10 MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-secondary" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    A carregar... {uploadProgress}%
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                disabled={isSubmitting || !selectedFile || !!emailWarning || isCheckingEmail}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Submeter Comunicação
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
