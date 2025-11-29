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
    const { data, error } = await supabase
      .from("participantes")
      .insert([{
        nomeCompleto: participante.nomeCompleto,
        email: participante.email.toLowerCase(),
        instituicao: participante.instituicao,
        tipoInscricao: participante.tipoInscricao,
        pais: participante.pais,
        consentimentoRGPD: participante.consentimentoRGPD,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .order("criadoEm", { ascending: false });

    if (error) throw error;
    return data;
  },

  async count() {
    const { count, error } = await supabase
      .from("participantes")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },
};

// Funções de persistência para Comunicações
export const comunicacoesService = {
  async create(comunicacao: Comunicacao) {
    const { data, error } = await supabase
      .from("comunicacoes")
      .insert([{
        titulo: comunicacao.titulo,
        resumo: comunicacao.resumo,
        autores: comunicacao.autores,
        areaTematica: comunicacao.areaTematica,
        participanteId: comunicacao.participanteId,
        ficheiroUrl: comunicacao.ficheiroUrl,
        ficheiroNome: comunicacao.ficheiroNome,
        ficheiroTipo: comunicacao.ficheiroTipo,
        ficheiroTamanho: comunicacao.ficheiroTamanho,
        estado: "submetida",
      }])
      .select()
      .single();

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
    const { data, error } = await supabase
      .from("comunicacoes")
      .select("*")
      .order("criadoEm", { ascending: false });

    if (error) throw error;
    return data;
  },

  async count() {
    const { count, error } = await supabase
      .from("comunicacoes")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const fileName = `${Date.now()}_${file.name}`;
    
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
