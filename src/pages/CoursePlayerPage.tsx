import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Clock, Users, Star, 
  CheckCircle2, MessageSquare, Download, Share2,
  Lock
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { LessonList } from "@/components/video/LessonList";
import { PayPalCheckout } from "@/components/payment/PayPalCheckout";
import { demoCourses, DemoLesson } from "@/data/demo-data";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const course = demoCourses.find((c) => c.id === courseId) || demoCourses[0];
  const modules = course.modules || [];

  // Check enrollment
  const { hasActiveEnrollment, isLoading: enrollmentLoading } = useEnrollment(courseId);

  // Admin always has access
  const hasAccess = isAdmin || hasActiveEnrollment;

  // Get first unlocked lesson as default
  const firstUnlockedLesson = useMemo(() => {
    for (const mod of modules) {
      const lesson = mod.lessons.find((l) => !l.locked && !l.completed);
      if (lesson) return lesson;
    }
    return modules[0]?.lessons[0];
  }, [modules]);

  const [currentLesson, setCurrentLesson] = useState<DemoLesson | null>(
    firstUnlockedLesson || null
  );

  const [showSidebar, setShowSidebar] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSelectLesson = (lesson: DemoLesson) => {
    if (!hasAccess && !lesson.locked) {
      // Only preview lessons are accessible
      if (modules.flatMap(m => m.lessons).indexOf(lesson) === 0) {
        setCurrentLesson(lesson);
      } else {
        setShowPaymentModal(true);
      }
    } else if (hasAccess) {
      setCurrentLesson(lesson);
    } else {
      setShowPaymentModal(true);
    }
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      course.color === "primary" && "bg-primary/20 text-primary",
                      course.color === "secondary" && "bg-secondary/20 text-secondary",
                      course.color === "accent" && "bg-accent/20 text-accent"
                    )}
                  >
                    <course.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-lg">{course.title}</h1>
                    <p className="text-xs text-muted-foreground">
                      {completedLessons}/{totalLessons} lecciones completadas
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!hasAccess && (
                  <NeonButton
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <Lock className="w-4 h-4" />
                    Desbloquear Programa
                  </NeonButton>
                )}
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="hidden md:flex"
                >
                  <BookOpen className="w-4 h-4" />
                  {showSidebar ? "Ocultar" : "Mostrar"} contenido
                </NeonButton>
              </div>
            </div>
          </header>

          {/* Locked Content Banner */}
          {!hasAccess && !enrollmentLoading && (
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/20 px-4 py-3">
              <div className="flex items-center justify-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  Este programa está bloqueado. Completa el pago para acceder a todo el contenido.
                </span>
                <NeonButton size="sm" onClick={() => setShowPaymentModal(true)}>
                  Desbloquear Ahora
                </NeonButton>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
            {/* Video Area */}
            <div className={cn("flex-1 space-y-6", !showSidebar && "lg:max-w-5xl lg:mx-auto")}>
              {currentLesson ? (
                <>
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                  />

                  {/* Lesson Info */}
                  <HolographicCard className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-heading font-bold">
                          {currentLesson.title}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                          {currentLesson.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="p-2 rounded-lg glass hover:bg-white/5 transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg glass hover:bg-white/5 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                      <NeonButton size="sm" disabled={!hasAccess}>
                        <CheckCircle2 className="w-4 h-4" />
                        Marcar como completada
                      </NeonButton>
                      <NeonButton variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                        Preguntas ({Math.floor(Math.random() * 20 + 5)})
                      </NeonButton>
                      <div className="flex items-center gap-1 ml-auto text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{currentLesson.duration}</span>
                      </div>
                    </div>
                  </HolographicCard>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <HolographicCard className="text-center p-4">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold">2,847</div>
                      <div className="text-xs text-muted-foreground">Estudiantes</div>
                    </HolographicCard>
                    <HolographicCard className="text-center p-4">
                      <Star className="w-6 h-6 mx-auto mb-2 text-secondary" />
                      <div className="text-lg font-bold">4.9</div>
                      <div className="text-xs text-muted-foreground">Calificación</div>
                    </HolographicCard>
                    <HolographicCard className="text-center p-4">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-accent" />
                      <div className="text-lg font-bold">{totalLessons}</div>
                      <div className="text-xs text-muted-foreground">Lecciones</div>
                    </HolographicCard>
                    <HolographicCard className="text-center p-4">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold">{course.duration}</div>
                      <div className="text-xs text-muted-foreground">Duración</div>
                    </HolographicCard>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96 rounded-2xl glass">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Selecciona una lección para comenzar
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Sidebar */}
            {showSidebar && (
              <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">Contenido del Curso</h3>
                  <span className="text-sm text-muted-foreground">
                    {course.progress}% completado
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                {/* Lessons */}
                <LessonList
                  modules={modules}
                  currentLessonId={currentLesson?.id || ""}
                  onSelectLesson={handleSelectLesson}
                  hasAccess={hasAccess}
                />
              </div>
            )}
          </div>
        </main>

        {/* PayPal Checkout Modal */}
        <PayPalCheckout
          programId={courseId || ""}
          programTitle={course.title}
          price={497}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    </SidebarProvider>
  );
};

export default CoursePlayerPage;
