import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Upload, FileText, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";

const comunicacaoSchema = z.object({
  titulo: z.string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  resumo: z.string()
    .min(50, "Resumo deve ter pelo menos 50 caracteres")
    .max(2000, "Resumo deve ter no máximo 2000 caracteres"),
  autores: z.string()
    .min(2, "Autores é obrigatório"),
  areaTematica: z.string()
    .min(2, "Área temática é obrigatória"),
  participanteEmail: z.string()
    .email("Email inválido")
    .toLowerCase(),
});

type ComunicacaoForm = z.infer<typeof comunicacaoSchema>;

export default function SubmitPaper() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ComunicacaoForm>({
    resolver: zodResolver(comunicacaoSchema),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas ficheiros PDF são permitidos");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ficheiro não pode exceder 10 MB");
      return;
    }

    setSelectedFile(file);
    toast.success(`Ficheiro "${file.name}" selecionado`);
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
      const { data: participante, error: participanteError } = await supabase
        .from("participantes")
        .select("id, tipoInscricao")
        .eq("email", data.participanteEmail)
        .single();

      if (participanteError || !participante) {
        toast.error("Email não encontrado. Por favor registe-se primeiro.");
        setIsSubmitting(false);
        return;
      }

      if (participante.tipoInscricao !== "investigador") {
        toast.error("Apenas investigadores podem submeter comunicações.");
        setIsSubmitting(false);
        return;
      }

      // Upload do ficheiro
      const fileExt = "pdf";
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `comunicacoes/${fileName}`;

      setUploadProgress(50);

      const { error: uploadError } = await supabase.storage
        .from("comunicacoes")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      setUploadProgress(75);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("comunicacoes")
        .getPublicUrl(filePath);

      // Inserir comunicação
      const { data: comunicacao, error: insertError } = await supabase
        .from("comunicacoes")
        .insert({
          titulo: data.titulo,
          resumo: data.resumo,
          autores: data.autores,
          areaTematica: data.areaTematica,
          participanteId: participante.id,
          ficheiroUrl: publicUrl,
          ficheiroNome: selectedFile.name,
          ficheiroTipo: selectedFile.type,
          ficheiroTamanho: selectedFile.size,
          estado: "submetida",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setUploadProgress(100);

      toast.success("Comunicação submetida com sucesso!", {
        description: "Receberá um email de confirmação em breve.",
      });

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
                disabled={isSubmitting || !selectedFile}
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
