import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface CommunicationData {
  titulo: string;
  resumo: string;
  autores: string;
  areaTematica: string;
  participanteId: string;
  ficheiroUrl: string;
  ficheiroNome: string;
  ficheiroTipo: string;
  ficheiroTamanho: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const communicationData: CommunicationData = await req.json();

    console.log('Submitting communication:', communicationData.titulo);

    // Validar dados básicos
    if (!communicationData.titulo || !communicationData.resumo || !communicationData.autores || 
        !communicationData.areaTematica || !communicationData.participanteId || !communicationData.ficheiroUrl) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios em falta' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Criar cliente com service_role para contornar RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Inserir comunicação
    const { data, error } = await supabaseAdmin
      .from('comunicacoes')
      .insert({
        titulo: communicationData.titulo,
        resumo: communicationData.resumo,
        autores: communicationData.autores,
        areaTematica: communicationData.areaTematica,
        participanteId: communicationData.participanteId,
        ficheiroUrl: communicationData.ficheiroUrl,
        ficheiroNome: communicationData.ficheiroNome,
        ficheiroTipo: communicationData.ficheiroTipo,
        ficheiroTamanho: communicationData.ficheiroTamanho,
        estado: 'submetida',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir comunicação:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao submeter comunicação' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Comunicação submetida com sucesso:', data.id);

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
