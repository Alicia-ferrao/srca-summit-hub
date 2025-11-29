import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, FileText, BarChart3, Shield, Lock, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Index() {
  const navigate = useNavigate();
  const { participantesCount, comunicacoesCount } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Navigation Menu */}
      <nav className="sticky top-0 z-50 glass-effect border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all duration-300" />
                <BarChart3 className="h-8 w-8 text-primary relative z-10 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-xl font-bold tracking-tight">SRCA</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/register")}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registar
              </Button>
              <Button
                onClick={() => navigate("/submit")}
                size="sm"
                variant="outline"
                className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
              >
                <FileText className="mr-2 h-4 w-4" />
                Submeter
              </Button>
              <Button
                onClick={() => navigate("/admin")}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Lock className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8 animate-fade-in-up">
            {/* Icon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-float">
              <Sparkles className="h-4 w-4" />
              <span>Sistema Automático de Conferências</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
                SRCA
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
                Gestão Inteligente de Conferências
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Plataforma completa para registo de participantes e submissão de comunicações científicas.
              Moderna, segura e eficiente.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <UserPlus className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">Registar Participante</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/submit")}
                className="border-2 hover-lift"
              >
                <FileText className="mr-2 h-5 w-5" />
                Submeter Comunicação
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 relative">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Participants Card */}
            <Card className="border-border/50 hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Participantes
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-4xl font-bold text-foreground">{participantesCount}</p>
                <p className="text-sm text-muted-foreground mt-2">Total registados</p>
              </CardContent>
            </Card>

            {/* Communications Card */}
            <Card className="border-border/50 hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Comunicações
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-4xl font-bold text-foreground">{comunicacoesCount}</p>
                <p className="text-sm text-muted-foreground mt-2">Submetidas</p>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="border-border/50 hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Segurança
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-4xl font-bold text-foreground">100%</p>
                <p className="text-sm text-muted-foreground mt-2">Conforme RGPD</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Funcionalidades</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo o que precisa para gerir a sua conferência de forma eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <Card className="group hover-lift border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Registo Simplificado</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Formulário intuitivo com validação em tempo real e conformidade RGPD
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2">
                {["Validação automática", "Email de confirmação", "Proteção de dados"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover-lift border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>Submissão Fácil</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Upload de ficheiros PDF com drag & drop e validação automática
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2">
                {["Upload até 10 MB", "Validação de formato", "Notificações automáticas"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover-lift border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Dashboard Admin</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Gestão completa com filtros avançados e exportação de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2">
                {["Pesquisa avançada", "Exportação CSV/JSON", "Estatísticas em tempo real"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover-lift border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle>Design Premium</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Interface moderna, elegante e totalmente responsiva
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2">
                {["Design contemporâneo", "Animações suaves", "Acessibilidade completa"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-semibold">SRCA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Sistema de Registo de Conferências Automático
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Conforme RGPD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
