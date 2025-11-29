import { z } from "zod";

// Schemas de validação centralizados
export const participantSchema = z.object({
  nomeCompleto: z.string()
    .trim()
    .min(1, "Nome completo é obrigatório")
    .max(100, "Nome muito longo"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  instituicao: z.string()
    .trim()
    .min(1, "Instituição é obrigatória")
    .max(200, "Nome da instituição muito longo"),
  tipoInscricao: z.enum(["estudante", "investigador", "convidado"], {
    errorMap: () => ({ message: "Tipo de inscrição inválido" }),
  }),
  pais: z.string()
    .trim()
    .min(1, "País é obrigatório")
    .max(100, "Nome do país muito longo"),
  consentimentoRGPD: z.boolean()
    .refine((val) => val === true, {
      message: "Deve aceitar os termos RGPD",
    }),
});

export const comunicacaoSchema = z.object({
  titulo: z.string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  resumo: z.string()
    .trim()
    .min(1, "Resumo é obrigatório")
    .max(2000, "Resumo muito longo"),
  autores: z.string()
    .trim()
    .min(1, "Autores são obrigatórios")
    .max(500, "Lista de autores muito longa"),
  areaTematica: z.string()
    .trim()
    .min(1, "Área temática é obrigatória")
    .max(100, "Área temática muito longa"),
  participanteEmail: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
});

// Tipos inferidos dos schemas
export type ParticipantForm = z.infer<typeof participantSchema>;
export type ComunicacaoForm = z.infer<typeof comunicacaoSchema>;

// Validações de negócio
export const businessValidations = {
  canSubmitComunicacao(tipoInscricao: string): boolean {
    return tipoInscricao === "investigador";
  },

  validateFileType(file: File): boolean {
    return file.type === "application/pdf";
  },

  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  },

  getFileErrorMessage(file: File): string | null {
    if (!this.validateFileType(file)) {
      return "Apenas ficheiros PDF são aceites";
    }
    if (!this.validateFileSize(file)) {
      return "O ficheiro não pode exceder 10MB";
    }
    return null;
  },
};
