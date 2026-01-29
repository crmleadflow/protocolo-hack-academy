import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, BookOpen, Trophy, Zap, Clock, ChevronRight,
  Lock, CheckCircle, Loader2
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatCard } from "@/components/ui/stat-card";
import { useStudentPrograms } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useAuth } from "@/contexts/AuthContext";
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { programs, isLoading } = useStudentPrograms();
  const { enrollments } = useEnrollment();

  // Helper to check if user has active enrollment for a program
  const hasActiveEnrollment = (programId: string) => {
    if (isAdmin) return true;
    const enrollment = enrollments.find((e) => e.program_id === programId);
    return enrollment?.status === "active" && 
      (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());
  };

  // Calculate stats
  const activePrograms = programs.filter(
    (p) => hasActiveEnrollment(p.id) || p.price === 0
  );
  const inProgressPrograms = activePrograms.filter(
    (p) => p.progress > 0 && p.progress < 100
  );
  const completedPrograms = activePrograms.filter((p) => p.progress === 100);
  const totalLessons = activePrograms.reduce((acc, p) => acc + p.totalLessons, 0);
  const completedLessons = activePrograms.reduce(
    (acc, p) => acc + p.completedLessons,
    0
  );

  // Get username from user metadata or email
  const userName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Estudiante";

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
                    ¡Hola, {userName}! 👋
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Bienvenido a tu Central de Inteligencia
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* XP Display */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-heading font-bold text-primary">
                    {completedLessons * 50} XP
                  </span>
                </div>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Programas"
                  value={programs.length}
                  subtitle="disponibles"
                  icon={BookOpen}
                  color="primary"
                />
                <StatCard
                  title="Completados"
                  value={completedPrograms.length}
                  subtitle={`de ${programs.length} programas`}
                  icon={Trophy}
                  color="secondary"
                />
                <StatCard
                  title="Lecciones"
                  value={completedLessons}
                  subtitle={`de ${totalLessons} totales`}
                  icon={Play}
                  color="accent"
                />
                <StatCard
                  title="En Progreso"
                  value={inProgressPrograms.length}
                  subtitle="programas activos"
                  icon={Clock}
                  color="primary"
                />
              </div>

              {/* Continue Learning */}
              {inProgressPrograms.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold">
                      Continuar Aprendiendo
                    </h2>
                    <NeonButton
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/catalog")}
                    >
                      Ver todos
                      <ChevronRight className="w-4 h-4" />
                    </NeonButton>
                  </div>

                  <div className="space-y-4">
                    {inProgressPrograms.slice(0, 3).map((program) => (
                      <HolographicCard
                        key={program.id}
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => navigate(`/course/${program.id}`)}
                      >
                        <div className="relative flex-shrink-0">
                          <ProgressRing
                            progress={program.progress}
                            size={60}
                            strokeWidth={4}
                          >
                            {program.thumbnail_url ? (
                              <img
                                src={program.thumbnail_url}
                                alt=""
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <BookOpen className="w-6 h-6 text-primary" />
                            )}
                          </ProgressRing>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold truncate">
                            {program.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {program.completedLessons} de {program.totalLessons}{" "}
                            lecciones
                          </p>
                          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                              style={{ width: `${program.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <NeonButton size="sm">
                            <Play className="w-4 h-4" />
                            Continuar
                          </NeonButton>
                        </div>
                      </HolographicCard>
                    ))}
                  </div>
                </div>
              )}

              {/* All Programs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold">
                    Programas Disponibles
                  </h2>
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/catalog")}
                  >
                    Ver catálogo
                    <ChevronRight className="w-4 h-4" />
                  </NeonButton>
                </div>

                {programs.length === 0 ? (
                  <HolographicCard className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">
                      No hay programas disponibles
                    </h3>
                    <p className="text-muted-foreground">
                      Los programas aparecerán aquí cuando estén publicados
                    </p>
                  </HolographicCard>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map((program) => {
                      const isActive = hasActiveEnrollment(program.id) || program.price === 0;
                      const isLocked = !isActive && program.price > 0;

                      return (
                        <HolographicCard
                          key={program.id}
                          variant={program.progress > 0 ? "gradient" : "default"}
                          className="cursor-pointer group relative overflow-hidden"
                          onClick={() => navigate(`/course/${program.id}`)}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video -mx-4 -mt-4 mb-4 overflow-hidden bg-muted">
                            {program.thumbnail_url ? (
                              <img
                                src={program.thumbnail_url}
                                alt={program.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                <BookOpen className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}

                            {/* Lock Overlay on hover */}
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex flex-col items-center gap-2 text-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-lg shadow-primary/20">
                                    <Lock className="w-7 h-7 text-primary" />
                                  </div>
                                  <span className="text-lg font-heading font-bold text-primary">
                                    ${program.price} {program.currency}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Click para desbloquear
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              {isActive && program.price > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
                                  <CheckCircle className="w-3 h-3" />
                                  Activo
                                </span>
                              )}
                              {program.price === 0 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground backdrop-blur-sm">
                                  Gratis
                                </span>
                              )}
                              {isLocked && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted/90 text-muted-foreground backdrop-blur-sm flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  ${program.price}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Program Info */}
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors flex-1">
                              {program.title}
                            </h3>
                            {program.progress > 0 && (
                              <ProgressRing progress={program.progress} size={40} strokeWidth={3}>
                                <span className="text-[10px] font-bold">{program.progress}%</span>
                              </ProgressRing>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {program.description || "Sin descripción"}
                          </p>

                          {/* Meta */}
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
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        {/* Floating button for mobile */}
        <FloatingSidebarTrigger />
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
