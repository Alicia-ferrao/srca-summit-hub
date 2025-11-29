import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SuccessPaper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [comunicacao, setComunicacao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComunicacao = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-communication', {
          body: { id }
        });

        if (error) {
          console.error('Erro ao buscar comunicação:', error);
          setLoading(false);
          return;
        }

        if (data?.comunicacao) {
          setComunicacao(data.comunicacao);
        }
      } catch (error) {
        console.error('Erro ao buscar comunicação:', error);
      }
      
      setLoading(false);
    };

    fetchComunicacao();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full border-secondary/20 shadow-2xl animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 bg-secondary/10 rounded-full w-fit animate-glow-pulse">
            <CheckCircle2 className="h-16 w-16 text-secondary" />
          </div>
          <CardTitle className="text-3xl">Comunicação Submetida!</CardTitle>
          <CardDescription className="text-lg">
            A sua comunicação foi submetida com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : comunicacao ? (
            <>
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">ID da Comunicação</p>
                  <p className="font-mono text-sm">{comunicacao.id}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Título</p>
                  <p className="font-medium">{comunicacao.titulo}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Ficheiro</p>
                  <p className="text-sm">{comunicacao.ficheiroNome}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(comunicacao.ficheiroTamanho / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Estado</p>
                  <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                    {comunicacao.estado}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Receberá um email de confirmação em breve</p>
                <p>✓ A sua comunicação será analisada pela comissão</p>
                <p>✓ Será notificado sobre o estado da sua submissão</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {comunicacao.ficheiroUrl && (
                  <Button
                    onClick={() => window.open(comunicacao.ficheiroUrl, "_blank")}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Ver Ficheiro
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">Comunicação não encontrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
