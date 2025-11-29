import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { participantesService, comunicacoesService } from "@/lib/supabase";

type AppContextType = {
  participantesCount: number;
  comunicacoesCount: number;
  refreshStats: () => Promise<void>;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [participantesCount, setParticipantesCount] = useState(0);
  const [comunicacoesCount, setComunicacoesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    try {
      const [pCount, cCount] = await Promise.all([
        participantesService.count(),
        comunicacoesService.count(),
      ]);
      setParticipantesCount(pCount);
      setComunicacoesCount(cCount);
    } catch (error) {
      // Silenciar erros - stats só disponíveis via admin dashboard
      console.log("Stats only available via admin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Remover carregamento automático - stats carregados apenas no admin dashboard
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        participantesCount,
        comunicacoesCount,
        refreshStats,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
