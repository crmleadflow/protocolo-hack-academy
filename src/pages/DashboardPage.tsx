import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, BookOpen, Trophy, Zap, Target, Clock, ChevronRight,
  TrendingUp, Award, Star, Flame
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatCard } from "@/components/ui/stat-card";
import { BadgeDisplay } from "@/components/ui/badge-display";
import { demoUser, demoCourses, demoBadges } from "@/data/demo-data";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = demoUser;
  const courses = demoCourses;
  const badges = demoBadges;

  // Calculate stats
  const completedCourses = courses.filter(c => c.progress === 100).length;
  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100);
  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);

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
                    ¡Hola, {user.name.split(" ")[0]}! 👋
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
                  <span className="font-heading font-bold text-primary">{user.xp.toLocaleString()} XP</span>
                </div>
                {/* Streak */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-heading font-bold">{user.streak} días</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Nivel Actual"
                value={user.level}
                subtitle="Hacker Pro"
                icon={Trophy}
                color="primary"
              />
              <StatCard
                title="Cursos Completados"
                value={completedCourses}
                subtitle={`de ${courses.length} programas`}
                icon={BookOpen}
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
                title="Horas de Estudio"
                value={user.hoursWatched}
                subtitle="este mes"
                icon={Clock}
                color="primary"
              />
            </div>

            {/* Progress Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Continue Learning */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold">Continuar Aprendiendo</h2>
                  <NeonButton variant="ghost" size="sm" onClick={() => navigate("/catalog")}>
                    Ver todos
                    <ChevronRight className="w-4 h-4" />
                  </NeonButton>
                </div>

                <div className="space-y-4">
                  {inProgressCourses.slice(0, 3).map((course) => (
                    <HolographicCard
                      key={course.id}
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <div className="relative flex-shrink-0">
                        <ProgressRing progress={course.progress} size={60} strokeWidth={4}>
                          <course.icon className="w-6 h-6 text-primary" />
                        </ProgressRing>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold truncate">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.completedLessons} de {course.totalLessons} lecciones
                        </p>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
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

              {/* Achievements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold">Logros</h2>
                  <span className="text-sm text-muted-foreground">
                    {badges.filter(b => b.unlocked).length}/{badges.length}
                  </span>
                </div>

                <HolographicCard variant="gradient" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {badges.slice(0, 6).map((badge) => (
                      <BadgeDisplay key={badge.id} badge={badge} size="md" />
                    ))}
                  </div>
                  <NeonButton variant="outline" size="sm" className="w-full">
                    Ver todos los logros
                  </NeonButton>
                </HolographicCard>

                {/* Level Progress */}
                <HolographicCard className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <ProgressRing progress={(user.xp % 1000) / 10} size={100} strokeWidth={6}>
                      <div className="text-center">
                        <span className="text-2xl font-heading font-bold">{user.level}</span>
                        <p className="text-xs text-muted-foreground">Nivel</p>
                      </div>
                    </ProgressRing>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{1000 - (user.xp % 1000)} XP</span> para el siguiente nivel
                  </p>
                </HolographicCard>
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold">Recomendados para Ti</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.filter(c => c.progress === 0).slice(0, 3).map((course) => (
                  <HolographicCard
                    key={course.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <course.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {course.totalLessons} lecciones
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </HolographicCard>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
