-- Criar tabela de participantes
CREATE TABLE IF NOT EXISTS public.participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nomeCompleto" TEXT NOT NULL CHECK (length("nomeCompleto") >= 2 AND length("nomeCompleto") <= 80),
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  instituicao TEXT NOT NULL CHECK (length(instituicao) >= 2 AND length(instituicao) <= 80),
  "tipoInscricao" TEXT NOT NULL CHECK ("tipoInscricao" IN ('estudante', 'investigador', 'organizador', 'convidado')),
  pais TEXT NOT NULL CHECK (length(pais) >= 2),
  "consentimentoRGPD" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de comunicações
CREATE TABLE IF NOT EXISTS public.comunicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (length(titulo) >= 5 AND length(titulo) <= 120),
  resumo TEXT NOT NULL CHECK (length(resumo) >= 50 AND length(resumo) <= 2000),
  autores TEXT NOT NULL,
  "areaTematica" TEXT NOT NULL,
  "ficheiroUrl" TEXT NOT NULL,
  "ficheiroNome" TEXT NOT NULL,
  "ficheiroTipo" TEXT NOT NULL,
  "ficheiroTamanho" INTEGER NOT NULL CHECK ("ficheiroTamanho" <= 10485760),
  "participanteId" UUID NOT NULL REFERENCES public.participantes(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'submetida' CHECK (estado IN ('submetida', 'rejeitada', 'aceite')),
  "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_participantes_email ON public.participantes(email);
CREATE INDEX IF NOT EXISTS idx_comunicacoes_participante ON public.comunicacoes("participanteId");
CREATE INDEX IF NOT EXISTS idx_comunicacoes_estado ON public.comunicacoes(estado);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir leitura e escrita pública (sistema aberto)
-- Para um sistema de produção real, isto deveria ser mais restrito

-- Participantes: permitir inserção pública (para registo)
CREATE POLICY "Permitir inserção pública de participantes"
  ON public.participantes
  FOR INSERT
  WITH CHECK (true);

-- Participantes: permitir leitura pública (para estatísticas e admin)
CREATE POLICY "Permitir leitura pública de participantes"
  ON public.participantes
  FOR SELECT
  USING (true);

-- Comunicações: permitir inserção pública (para submissões)
CREATE POLICY "Permitir inserção pública de comunicações"
  ON public.comunicacoes
  FOR INSERT
  WITH CHECK (true);

-- Comunicações: permitir leitura pública (para admin)
CREATE POLICY "Permitir leitura pública de comunicações"
  ON public.comunicacoes
  FOR SELECT
  USING (true);

-- Criar bucket de storage para comunicações (PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comunicacoes',
  'comunicacoes',
  true,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para comunicações
CREATE POLICY "Permitir upload público de PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'comunicacoes');

CREATE POLICY "Permitir leitura pública de PDFs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'comunicacoes');