import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface ParticipantData {
  nomeCompleto: string;
  email: string;
  instituicao: string;
  tipoInscricao: string;
  pais: string;
  consentimentoRGPD: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const participantData: ParticipantData = await req.json();

    console.log('Registering participant:', participantData.email);

    // Validar dados básicos
    if (!participantData.nomeCompleto || !participantData.email || !participantData.instituicao || 
        !participantData.tipoInscricao || !participantData.pais) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios em falta' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!participantData.consentimentoRGPD) {
      return new Response(
        JSON.stringify({ error: 'Consentimento RGPD é obrigatório' }),
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

    // Inserir participante
    const { data, error } = await supabaseAdmin
      .from('participantes')
      .insert({
        nomeCompleto: participantData.nomeCompleto,
        email: participantData.email.toLowerCase(),
        instituicao: participantData.instituicao,
        tipoInscricao: participantData.tipoInscricao,
        pais: participantData.pais,
        consentimentoRGPD: participantData.consentimentoRGPD,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir participante:', error);
      
      // Verificar se é erro de email duplicado
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Este email já está registado' }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao registar participante' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Participante registado com sucesso:', data.id);

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
