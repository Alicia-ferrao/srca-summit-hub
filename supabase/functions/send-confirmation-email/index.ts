import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ConfirmationEmailRequest {
  nomeCompleto: string;
  email: string;
  instituicao: string;
  tipoInscricao: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nomeCompleto, email, instituicao, tipoInscricao }: ConfirmationEmailRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SRCA <onboarding@resend.dev>",
        to: [email],
        subject: "SRCA — Confirmação de Inscrição",
        html: `
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
                <p>Olá <strong>${nomeCompleto}</strong>,</p>
                <p>A sua inscrição no SRCA foi confirmada com sucesso!</p>
                
                <div class="info-box">
                  <strong>Detalhes da Inscrição:</strong><br>
                  <strong>Nome:</strong> ${nomeCompleto}<br>
                  <strong>Email:</strong> ${email}<br>
                  <strong>Instituição:</strong> ${instituicao}<br>
                  <strong>Tipo de Inscrição:</strong> ${tipoInscricao}
                </div>

                ${tipoInscricao === 'investigador' ? `
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
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
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
