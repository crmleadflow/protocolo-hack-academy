import React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { MentorChatInterface } from "@/components/mentor/MentorChatInterface";
import { Loader2 } from "lucide-react";
import { useBonusAccess } from "@/hooks/useBonusAccess";
import { BonusLockedScreen } from "@/components/bonuses/BonusLockedScreen";

const MentorPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasMentorAccess, isLoading } = useBonusAccess();

  // Mostrar loading mientras verifica acceso
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no tiene acceso, mostrar pantalla de bloqueo
  if (!hasMentorAccess) {
    return <BonusLockedScreen bonusType="mentor" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 min-w-0 h-[100dvh] flex flex-col p-2 sm:p-3 lg:p-4 overflow-hidden">
          <div className="w-full max-w-5xl mx-auto flex-1 min-h-0">
            <MentorChatInterface onBack={() => navigate(-1)} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MentorPage;
