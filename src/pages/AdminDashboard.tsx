import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Search, Users, FileText, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [comunicacoes, setComunicacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [participantesRes, comunicacoesRes] = await Promise.all([
        supabase.from("participantes").select("*").order("criadoEm", { ascending: false }),
        supabase.from("comunicacoes").select("*").order("criadoEm", { ascending: false }),
      ]);

      if (participantesRes.data) setParticipantes(participantesRes.data);
      if (comunicacoesRes.data) setComunicacoes(comunicacoesRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    
    toast.success("Ficheiro exportado com sucesso");
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    
    toast.success("Ficheiro exportado com sucesso");
  };

  const filteredParticipantes = participantes.filter(p =>
    p.nomeCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.instituicao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComunicacoes = comunicacoes.filter(c =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.autores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.areaTematica?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <div className="w-32" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{participantes.length}</div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comunicações</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{comunicacoes.length}</div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {comunicacoes.filter(c => c.estado === "submetida").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Gestão de Dados</CardTitle>
                <CardDescription>Visualize e exporte participantes e comunicações</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="participantes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="participantes">Participantes</TabsTrigger>
                <TabsTrigger value="comunicacoes">Comunicações</TabsTrigger>
              </TabsList>

              <TabsContent value="participantes" className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredParticipantes, "participantes")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToJSON(filteredParticipantes, "participantes")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar JSON
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Instituição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>País</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipantes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhum participante encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredParticipantes.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.nomeCompleto}</TableCell>
                            <TableCell>{p.email}</TableCell>
                            <TableCell>{p.instituicao}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{p.tipoInscricao}</Badge>
                            </TableCell>
                            <TableCell>{p.pais}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="comunicacoes" className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredComunicacoes, "comunicacoes")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToJSON(filteredComunicacoes, "comunicacoes")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar JSON
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autores</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ficheiro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComunicacoes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhuma comunicação encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredComunicacoes.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium max-w-xs truncate">{c.titulo}</TableCell>
                            <TableCell className="max-w-xs truncate">{c.autores}</TableCell>
                            <TableCell>{c.areaTematica}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  c.estado === "aceite" ? "default" :
                                  c.estado === "rejeitada" ? "destructive" : "secondary"
                                }
                              >
                                {c.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {c.ficheiroUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(c.ficheiroUrl, "_blank")}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
