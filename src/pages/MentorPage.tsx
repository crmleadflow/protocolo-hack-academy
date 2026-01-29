import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MentorChatInterface } from "@/components/mentor/MentorChatInterface";
import { 
  Sparkles, Home, BookOpen, Brain, Trophy, Settings, 
  ChevronRight, ArrowLeft, Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";

const MentorPage: React.FC = () => {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const handleLinkClick = () => {
    setIsNavOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Collapsible Navigation Header */}
            <Collapsible open={isNavOpen} onOpenChange={setIsNavOpen}>
              <div className="glass-card rounded-xl p-4">
                {/* Header with Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      title="Volver"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <CollapsibleTrigger asChild>
                      <button 
                        className={cn(
                          "p-2 rounded-lg border border-border/50 transition-all",
                          isNavOpen 
                            ? "bg-secondary/20 border-secondary/50 text-secondary" 
                            : "hover:bg-muted/50"
                        )}
                        title={isNavOpen ? "Cerrar menú" : "Abrir menú"}
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                    </CollapsibleTrigger>
                    
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-secondary" />
                      <div className="text-left">
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gradient">
                          Héctor Galensky AI
                        </h1>
                        <p className="text-sm text-muted-foreground hidden md:block">
                          Tu Mentor 24/7
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Navigation Content */}
                <CollapsibleContent className="mt-4">
                  <div className="border-t border-border/50 pt-4 space-y-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                      <Link 
                        to="/dashboard" 
                        onClick={handleLinkClick}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span>Inicio</span>
                      </Link>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        Mentor IA
                      </span>
                    </div>

                    {/* Quick Navigation Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <Link
                        to="/dashboard"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Home className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                      <Link
                        to="/catalog"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Cursos</span>
                      </Link>
                      <Link
                        to="/neuro-scanner"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Brain className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Neuro Scanner</span>
                      </Link>
                      <Link
                        to="/achievements"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Logros</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Ajustes</span>
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm">
                      Tu asistente personal entrenado con el conocimiento de Héctor Galensky para guiarte en ventas y negocios.
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <MentorChatInterface />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MentorPage;
