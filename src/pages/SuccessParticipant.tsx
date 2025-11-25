import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Home } from "lucide-react";

export default function SuccessParticipant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full border-primary/20 shadow-2xl animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit animate-glow-pulse">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Registo Concluído!</CardTitle>
          <CardDescription className="text-lg">
            O seu registo foi efetuado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">ID do Participante</p>
            <p className="font-mono text-sm">{id}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Receberá um email de confirmação em breve</p>
            <p>✓ Os seus dados foram registados com segurança</p>
            <p>✓ Pode agora submeter uma comunicação</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/submit")}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <FileText className="mr-2 h-4 w-4" />
              Submeter Comunicação
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
