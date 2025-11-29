-- Corrigir políticas RLS para permitir inserção pública mas proteger leitura/atualização/eliminação

-- Remover políticas RESTRICTIVE antigas que estão a bloquear inserções
DROP POLICY IF EXISTS "Permitir inserção pública de participantes" ON public.participantes;
DROP POLICY IF EXISTS "Apenas admin pode ler participantes" ON public.participantes;
DROP POLICY IF EXISTS "Apenas admin pode atualizar participantes" ON public.participantes;
DROP POLICY IF EXISTS "Apenas admin pode deletar participantes" ON public.participantes;

DROP POLICY IF EXISTS "Permitir inserção pública de comunicações" ON public.comunicacoes;
DROP POLICY IF EXISTS "Apenas admin pode ler comunicações" ON public.comunicacoes;
DROP POLICY IF EXISTS "Apenas admin pode atualizar comunicações" ON public.comunicacoes;
DROP POLICY IF EXISTS "Apenas admin pode deletar comunicações" ON public.comunicacoes;

-- Criar políticas PERMISSIVE corretas para participantes
-- INSERT público permitido (para registo)
CREATE POLICY "Permitir inserção pública de participantes"
  ON public.participantes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT/UPDATE/DELETE bloqueados para utilizadores normais (apenas via service_role)
CREATE POLICY "Bloquear leitura pública de participantes"
  ON public.participantes
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Bloquear atualização pública de participantes"
  ON public.participantes
  FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Bloquear eliminação pública de participantes"
  ON public.participantes
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- Criar políticas PERMISSIVE corretas para comunicações
-- INSERT público permitido (para submissão)
CREATE POLICY "Permitir inserção pública de comunicações"
  ON public.comunicacoes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT/UPDATE/DELETE bloqueados para utilizadores normais (apenas via service_role)
CREATE POLICY "Bloquear leitura pública de comunicações"
  ON public.comunicacoes
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Bloquear atualização pública de comunicações"
  ON public.comunicacoes
  FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Bloquear eliminação pública de comunicações"
  ON public.comunicacoes
  FOR DELETE
  TO anon, authenticated
  USING (false);