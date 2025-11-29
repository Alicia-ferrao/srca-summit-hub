import { supabase } from "@/integrations/supabase/client";

// Tipos para os dados
export type Participante = {
  id?: string;
  nomeCompleto?: string;
  email?: string;
  instituicao?: string;
  tipoInscricao?: string;
  pais?: string;
  consentimentoRGPD?: boolean;
};

export type Comunicacao = {
  id?: string;
  titulo: string;
  resumo: string;
  autores: string;
  areaTematica: string;
  participanteEmail?: string;
  participanteId?: string;
  ficheiroUrl: string;
  ficheiroNome: string;
  ficheiroTipo: string;
  ficheiroTamanho: number;
  estado?: string;
};

// Funções de persistência para Participantes
export const participantesService = {
  async create(participante: Participante) {
    const { data, error } = await supabase.functions.invoke("register-participant", {
      body: {
        nomeCompleto: participante.nomeCompleto,
        email: participante.email,
        instituicao: participante.instituicao,
        tipoInscricao: participante.tipoInscricao,
        pais: participante.pais,
        consentimentoRGPD: participante.consentimentoRGPD,
      },
    });

    if (error) throw error;
    return data;
  },

  async getByEmail(email: string) {
    // Usar edge function para verificar participante (seguro via service_role)
    const { data, error } = await supabase.functions.invoke("check-participant-type", {
      body: { email: email.toLowerCase() },
    });

    if (error) throw error;
    return data?.participante || null;
  },

  async getAll() {
    // Admin dashboard deve usar edge function
    const { data, error } = await supabase.functions.invoke("get-dashboard-stats");
    if (error) throw error;
    return data?.participantes || [];
  },

  async count() {
    // Admin dashboard deve usar edge function
    const { data, error } = await supabase.functions.invoke("get-dashboard-stats");
    if (error) throw error;
    return data?.stats?.participantesCount || 0;
  },
};

// Funções de persistência para Comunicações
export const comunicacoesService = {
  async create(comunicacao: Comunicacao) {
    const { data, error } = await supabase.functions.invoke("submit-communication", {
      body: {
        titulo: comunicacao.titulo,
        resumo: comunicacao.resumo,
        autores: comunicacao.autores,
        areaTematica: comunicacao.areaTematica,
        participanteId: comunicacao.participanteId,
        ficheiroUrl: comunicacao.ficheiroUrl,
        ficheiroNome: comunicacao.ficheiroNome,
        ficheiroTipo: comunicacao.ficheiroTipo,
        ficheiroTamanho: comunicacao.ficheiroTamanho,
      },
    });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("comunicacoes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll() {
    // Admin dashboard deve usar edge function
    const { data, error } = await supabase.functions.invoke("get-dashboard-stats");
    if (error) throw error;
    return data?.comunicacoes || [];
  },

  async count() {
    // Admin dashboard deve usar edge function
    const { data, error } = await supabase.functions.invoke("get-dashboard-stats");
    if (error) throw error;
    return data?.stats?.comunicacoesCount || 0;
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    // Sanitizar nome do ficheiro removendo espaços e caracteres especiais
    const sanitizedName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${Date.now()}_${sanitizedName}`;
    
    // Simulate progress for better UX
    if (onProgress) {
      onProgress(10);
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("comunicacoes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;
    if (onProgress) {
      onProgress(80);
    }

    const { data: urlData } = supabase.storage
      .from("comunicacoes")
      .getPublicUrl(fileName);

    if (onProgress) {
      onProgress(100);
    }

    return {
      url: urlData.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    };
  },
};

// Funções para Edge Functions
export const emailService = {
  async sendConfirmation(type: "participante" | "comunicacao", data: any) {
    try {
      const { error } = await supabase.functions.invoke("send-confirmation-email", {
        body: { type, data },
      });

      if (error) {
        console.error("Erro ao enviar email:", error);
      }
    } catch (error) {
      console.error("Erro ao invocar função de email:", error);
    }
  },
};
