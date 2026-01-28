import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, BookOpen, Trophy, Zap, Clock, ChevronRight,
  Flame, Loader2
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  const { user } = useAuth();
  const { programs, isLoading } = useStudentPrograms();

  // Calculate stats
  const inProgressPrograms = programs.filter(
    (p) => p.progress > 0 && p.progress < 100
  );
  const completedPrograms = programs.filter((p) => p.progress === 100);
  const totalLessons = programs.reduce((acc, p) => acc + p.totalLessons, 0);
  const completedLessons = programs.reduce(
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
                <h2 className="text-xl font-heading font-bold">
                  {inProgressPrograms.length > 0
                    ? "Explorar Más Programas"
                    : "Programas Disponibles"}
                </h2>

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
                    {programs
                      .filter((p) => p.progress === 0)
                      .slice(0, 6)
                      .map((program) => (
                        <HolographicCard
                          key={program.id}
                          className="cursor-pointer group"
                          onClick={() => navigate(`/course/${program.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                              {program.thumbnail_url ? (
                                <img
                                  src={program.thumbnail_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-semibold group-hover:text-primary transition-colors">
                                {program.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {program.description || "Sin descripción"}
                              </p>
                              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  {program.totalLessons} lecciones
                                </span>
                                <span>•</span>
                                <span className="text-primary font-medium">
                                  ${program.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </HolographicCard>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
