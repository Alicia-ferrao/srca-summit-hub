import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente com service_role para acessar dados
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

    // Buscar estatísticas
    const [
      { count: participantesCount },
      { count: comunicacoesCount },
      { data: participantes },
      { data: comunicacoes }
    ] = await Promise.all([
      supabaseAdmin.from('participantes').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('comunicacoes').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('participantes').select('*').order('criadoEm', { ascending: false }),
      supabaseAdmin.from('comunicacoes').select('*').order('criadoEm', { ascending: false })
    ]);

    return new Response(
      JSON.stringify({
        stats: {
          participantesCount: participantesCount || 0,
          comunicacoesCount: comunicacoesCount || 0,
        },
        participantes: participantes || [],
        comunicacoes: comunicacoes || []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
