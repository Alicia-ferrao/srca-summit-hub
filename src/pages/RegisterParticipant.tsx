import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { participantSchema, type ParticipantForm } from "@/services/validationServices";
import { participantesService, emailService } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

export default function RegisterParticipant() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshStats } = useApp();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ParticipantForm>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      consentimentoRGPD: false,
    },
  });

  const consentimentoRGPD = watch("consentimentoRGPD");

  const onSubmit = async (data: ParticipantForm) => {
    setIsSubmitting(true);
    try {
      const participant = await participantesService.create(data);

      // Enviar email de confirmação
      await emailService.sendConfirmation("participante", {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        instituicao: data.instituicao,
        tipoInscricao: data.tipoInscricao,
      });

      toast.success("Registo concluído com sucesso!", {
        description: "Receberá um email de confirmação em breve.",
      });

      await refreshStats();
      navigate(`/success/participant?id=${participant.id}`);
    } catch (error: any) {
      console.error("Erro ao registar participante:", error);
      if (error.code === "23505") {
        toast.error("Este email já está registado");
      } else {
        toast.error("Erro ao processar o registo. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
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
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Registar Participante</CardTitle>
                <CardDescription>Preencha os seus dados para participar na conferência</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  placeholder="José Silva"
                  {...register("nomeCompleto")}
                  className={errors.nomeCompleto ? "border-destructive" : ""}
                />
                {errors.nomeCompleto && (
                  <p className="text-sm text-destructive">{errors.nomeCompleto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jose.silva@exemplo.pt"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instituicao">Instituição *</Label>
                <Input
                  id="instituicao"
                  placeholder="Universidade de Lisboa"
                  {...register("instituicao")}
                  className={errors.instituicao ? "border-destructive" : ""}
                />
                {errors.instituicao && (
                  <p className="text-sm text-destructive">{errors.instituicao.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoInscricao">Tipo de Inscrição *</Label>
                <Select onValueChange={(value) => setValue("tipoInscricao", value as any)}>
                  <SelectTrigger id="tipoInscricao" className={errors.tipoInscricao ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estudante">Estudante</SelectItem>
                    <SelectItem value="investigador">Investigador</SelectItem>
                    <SelectItem value="convidado">Convidado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoInscricao && (
                  <p className="text-sm text-destructive">{errors.tipoInscricao.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Input
                  id="pais"
                  placeholder="Portugal"
                  {...register("pais")}
                  className={errors.pais ? "border-destructive" : ""}
                />
                {errors.pais && (
                  <p className="text-sm text-destructive">{errors.pais.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
                <Checkbox
                  id="consentimentoRGPD"
                  checked={consentimentoRGPD}
                  onCheckedChange={(checked) => setValue("consentimentoRGPD", checked as boolean)}
                  className={errors.consentimentoRGPD ? "border-destructive" : ""}
                />
                <div className="space-y-1">
                  <Label htmlFor="consentimentoRGPD" className="cursor-pointer">
                    Consentimento RGPD *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Concordo com o tratamento dos meus dados pessoais de acordo com o Regulamento Geral de Proteção de Dados (RGPD).
                  </p>
                  {errors.consentimentoRGPD && (
                    <p className="text-sm text-destructive">{errors.consentimentoRGPD.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registar
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
