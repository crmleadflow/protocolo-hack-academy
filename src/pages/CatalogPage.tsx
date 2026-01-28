import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Clock, BookOpen, Search, Lock, Loader2
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { GlassInput } from "@/components/ui/glass-input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useStudentPrograms } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { cn } from "@/lib/utils";

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { programs, isLoading } = useStudentPrograms();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = programs.filter((program) =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (program.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-heading font-bold">
                    Arsenal de Entrenamiento
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {programs.length} programas disponibles
                  </p>
                </div>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <GlassInput
                  type="text"
                  placeholder="Buscar programas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Programs Grid */}
              {filteredPrograms.length === 0 ? (
                <HolographicCard className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold mb-2">
                    {programs.length === 0
                      ? "No hay programas disponibles"
                      : "No se encontraron programas"}
                  </h3>
                  <p className="text-muted-foreground">
                    {programs.length === 0
                      ? "Los programas aparecerán aquí cuando estén publicados"
                      : "Intenta con otros términos de búsqueda"}
                  </p>
                </HolographicCard>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map((program, index) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      index={index}
                      onClick={() => navigate(`/course/${program.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

// Separate component to handle enrollment check for each program
function ProgramCard({
  program,
  index,
  onClick,
}: {
  program: any;
  index: number;
  onClick: () => void;
}) {
  const { hasActiveEnrollment, isLoading } = useEnrollment(program.id);
  const isLocked = !hasActiveEnrollment && program.price > 0;

  return (
    <HolographicCard
      variant={program.progress > 0 ? "gradient" : "default"}
      className="group cursor-pointer animate-fade-in flex flex-col relative overflow-hidden"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center border-2 border-muted-foreground/30">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="text-lg font-heading font-bold text-primary">
              ${program.price} {program.currency}
            </span>
            <span className="text-xs text-muted-foreground">
              Desbloquear acceso
            </span>
          </div>
        </div>
      )}

      {/* Program Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden">
          {program.thumbnail_url ? (
            <img
              src={program.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-7 h-7 text-primary" />
          )}
        </div>
        {program.progress > 0 && (
          <ProgressRing progress={program.progress} size={48} strokeWidth={3}>
            <span className="text-xs font-bold">{program.progress}%</span>
          </ProgressRing>
        )}
        {program.progress === 0 && !isLocked && program.price > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
            ✓ Desbloqueado
          </span>
        )}
        {program.price === 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
            Gratis
          </span>
        )}
      </div>

      {/* Program Info */}
      <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {program.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
        {program.description || "Sin descripción"}
      </p>

      {/* Program Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {program.totalLessons} lecciones
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {program.modules.length} módulos
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {program.progress > 0 && program.progress < 100 && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            style={{ width: `${program.progress}%` }}
          />
        </div>
      )}
    </HolographicCard>
  );
}

export default CatalogPage;
