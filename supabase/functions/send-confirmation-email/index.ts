import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ParticipanteData {
  nomeCompleto: string;
  email: string;
  instituicao: string;
  tipoInscricao: string;
}

interface ComunicacaoData {
  titulo: string;
  autores: string;
  areaTematica: string;
  participanteEmail: string;
  participanteNome?: string;
}

interface EmailRequest {
  type: "participante" | "comunicacao";
  data: ParticipanteData | ComunicacaoData;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const requestBody: EmailRequest = await req.json();
    const { type, data } = requestBody;

    console.log("Processing email request:", { type, data });

    let emailTo: string;
    let emailSubject: string;
    let emailHtml: string;

    if (type === "participante") {
      const participante = data as ParticipanteData;
      emailTo = participante.email;
      emailSubject = "SRCA — Confirmação de Inscrição";
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #9b87f5 0%, #D946EF 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .info-box {
                background: #f9fafb;
                border-left: 4px solid #9b87f5;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
              }
              h1 {
                margin: 0;
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✓ Inscrição Confirmada</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${participante.nomeCompleto}</strong>,</p>
              <p>A sua inscrição no SRCA foi confirmada com sucesso!</p>
              
              <div class="info-box">
                <strong>Detalhes da Inscrição:</strong><br>
                <strong>Nome:</strong> ${participante.nomeCompleto}<br>
                <strong>Email:</strong> ${participante.email}<br>
                <strong>Instituição:</strong> ${participante.instituicao}<br>
                <strong>Tipo de Inscrição:</strong> ${participante.tipoInscricao}
              </div>

              ${participante.tipoInscricao === 'investigador' ? `
                <p>Como investigador, pode submeter comunicações através do portal.</p>
              ` : ''}

              <p>Se tiver alguma dúvida, não hesite em contactar-nos.</p>
              
              <p>Atenciosamente,<br>
              <strong>Equipa SRCA</strong></p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda diretamente.</p>
            </div>
          </body>
        </html>
      `;
    } else if (type === "comunicacao") {
      const comunicacao = data as ComunicacaoData;
      emailTo = comunicacao.participanteEmail;
      emailSubject = "SRCA — Confirmação de Submissão de Comunicação";
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #F97316 0%, #D946EF 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .info-box {
                background: #f9fafb;
                border-left: 4px solid #F97316;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
              }
              h1 {
                margin: 0;
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✓ Comunicação Submetida</h1>
            </div>
            <div class="content">
              <p>Olá${comunicacao.participanteNome ? ` <strong>${comunicacao.participanteNome}</strong>` : ''},</p>
              <p>A sua comunicação foi submetida com sucesso no SRCA!</p>
              
              <div class="info-box">
                <strong>Detalhes da Comunicação:</strong><br>
                <strong>Título:</strong> ${comunicacao.titulo}<br>
                <strong>Autores:</strong> ${comunicacao.autores}<br>
                <strong>Área Temática:</strong> ${comunicacao.areaTematica}
              </div>

              <p>A sua comunicação será analisada pela comissão científica. Será notificado sobre o resultado da avaliação.</p>

              <p>Se tiver alguma dúvida, não hesite em contactar-nos.</p>
              
              <p>Atenciosamente,<br>
              <strong>Equipa SRCA</strong></p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda diretamente.</p>
            </div>
          </body>
        </html>
      `;
    } else {
      throw new Error(`Invalid email type: ${type}`);
    }

    if (!emailTo) {
      throw new Error("Email destination is required");
    }

    console.log("Sending email to:", emailTo);

    const emailResponse = await resend.emails.send({
      from: "SRCA <onboarding@resend.dev>",
      to: [emailTo],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
