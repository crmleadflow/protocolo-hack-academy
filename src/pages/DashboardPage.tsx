import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, BookOpen, Trophy, Zap, Clock, ChevronRight, Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
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
    <AppLayout 
      title={`¡Hola, ${userName}! 👋`}
      subtitle="Bienvenido a tu Central de Inteligencia"
      headerContent={
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-primary">
            {completedLessons * 50} XP
          </span>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
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

          {/* Quick Actions */}
          {programs.length > 0 && inProgressPrograms.length === 0 && (
            <HolographicCard className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                ¡Comienza tu entrenamiento!
              </h3>
              <p className="text-muted-foreground mb-4">
                Explora nuestro catálogo de programas y empieza a aprender
              </p>
              <NeonButton onClick={() => navigate("/catalog")}>
                <BookOpen className="w-4 h-4" />
                Ver Catálogo
              </NeonButton>
            </HolographicCard>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
