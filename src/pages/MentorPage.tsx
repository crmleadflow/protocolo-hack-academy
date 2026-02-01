import React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { MentorChatInterface } from "@/components/mentor/MentorChatInterface";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
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
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Simple Header */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  title="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-gradient">
                      Mi Mentor IA
                    </h1>
                    <p className="text-sm text-muted-foreground hidden md:block">
                      Héctor Galensky 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <MentorChatInterface />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MentorPage;
