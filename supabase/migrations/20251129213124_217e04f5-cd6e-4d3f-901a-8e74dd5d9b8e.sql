-- =========================================================
-- CORREÇÃO DE SEGURANÇA: Proteger dados pessoais e submissões
-- =========================================================

-- 1. REMOVER políticas SELECT públicas que expõem dados sensíveis
DROP POLICY IF EXISTS "Permitir leitura pública de participantes" ON public.participantes;
DROP POLICY IF EXISTS "Permitir leitura pública de comunicações" ON public.comunicacoes;

-- 2. CRIAR políticas SELECT restritas (apenas para serviço/admin)
-- Participantes: apenas service_role pode ler (para admin dashboard)
CREATE POLICY "Apenas admin pode ler participantes"
ON public.participantes
FOR SELECT
TO service_role
USING (true);

-- Comunicações: apenas service_role pode ler (para admin dashboard)
CREATE POLICY "Apenas admin pode ler comunicações"
ON public.comunicacoes
FOR SELECT
TO service_role
USING (true);

-- 3. MANTER políticas INSERT públicas (para registro de conferência)
-- Estas já existem e são necessárias para UC01 e UC03
-- "Permitir inserção pública de participantes"
-- "Permitir inserção pública de comunicações"

-- 4. ADICIONAR políticas UPDATE/DELETE restritas
CREATE POLICY "Apenas admin pode atualizar participantes"
ON public.participantes
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Apenas admin pode deletar participantes"
ON public.participantes
FOR DELETE
TO service_role
USING (true);

CREATE POLICY "Apenas admin pode atualizar comunicações"
ON public.comunicacoes
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Apenas admin pode deletar comunicações"
ON public.comunicacoes
FOR DELETE
TO service_role
USING (true);