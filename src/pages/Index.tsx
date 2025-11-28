import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, FileText, BarChart3, Shield, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    participantes: 0,
    comunicacoes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [participantesRes, comunicacoesRes] = await Promise.all([
        supabase.from("participantes").select("id", { count: "exact", head: true }),
        supabase.from("comunicacoes").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        participantes: participantesRes.count || 0,
        comunicacoes: comunicacoesRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Menu */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">SRCA</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/register")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registar
              </Button>
              <Button
                onClick={() => navigate("/submit")}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <FileText className="mr-2 h-4 w-4" />
                Submeter
              </Button>
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Lock className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4 animate-glow-pulse">
              <BarChart3 className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              SRCA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Sistema de Registo de Conferências Automático
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Plataforma moderna para gestão de participantes e submissão de comunicações científicas
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Registar Participante
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/submit")}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <FileText className="mr-2 h-5 w-5" />
                Submeter Comunicação
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Participantes
                </CardTitle>
                <CardDescription>Total registados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{stats.participantes}</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  Comunicações
                </CardTitle>
                <CardDescription>Submetidas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-secondary">{stats.comunicacoes}</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-colors animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Segurança
                </CardTitle>
                <CardDescription>Conforme RGPD</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-accent">100%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principais</h2>
            <p className="text-muted-foreground">Sistema completo e intuitivo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border hover:shadow-xl transition-shadow animate-scale-in">
              <CardHeader>
                <CardTitle>Registo Simplificado</CardTitle>
                <CardDescription>
                  Formulário intuitivo com validações em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Validação automática de dados</p>
                <p>✓ Conformidade RGPD</p>
                <p>✓ Email de confirmação automático</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>Submissão de Comunicações</CardTitle>
                <CardDescription>
                  Upload de ficheiros PDF com drag & drop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Upload até 10 MB</p>
                <p>✓ Validação de formato</p>
                <p>✓ Notificações automáticas</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle>Dashboard Administrativo</CardTitle>
                <CardDescription>
                  Gestão completa de participantes e comunicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Filtros e pesquisa avançada</p>
                <p>✓ Exportação CSV/JSON</p>
                <p>✓ Estatísticas em tempo real</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle>Design Moderno</CardTitle>
                <CardDescription>
                  Interface elegante e acessível
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Tema moderno e elegante</p>
                <p>✓ Microinterações suaves</p>
                <p>✓ Totalmente responsivo</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Pronto para começar?</h2>
          <p className="text-lg text-muted-foreground">
            Registe-se como participante ou submeta a sua comunicação científica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Registar Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/admin")}
              className="border-border hover:bg-muted"
            >
              Acesso Admin
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
