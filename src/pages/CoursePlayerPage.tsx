import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Clock, Users, Star, 
  CheckCircle2, Lock, Loader2, Play
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { PayPalCheckout } from "@/components/payment/PayPalCheckout";
import { LessonResourceManager } from "@/components/lesson/LessonResourceManager";
import { useStudentProgramDetail, LessonWithProgress, ModuleWithProgress } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useLessonResources } from "@/hooks/useLessonResources";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { program, isLoading, markLessonCompleted } = useStudentProgramDetail(courseId);
  const { hasActiveEnrollment, isLoading: enrollmentLoading } = useEnrollment(courseId);

  // Admin always has access
  const hasAccess = isAdmin || hasActiveEnrollment;

  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  
  // Fetch resources for current lesson
  const { resources: lessonResources, refetch: refetchResources } = useLessonResources(currentLesson?.id);

  const [openModules, setOpenModules] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Set initial lesson when program loads
  useMemo(() => {
    if (program && program.modules.length > 0 && !currentLesson) {
      // Find first uncompleted lesson or first lesson
      for (const mod of program.modules) {
        const lesson = mod.lessons.find((l) => !l.completed);
        if (lesson) {
          setCurrentLesson(lesson);
          setOpenModules([mod.id]);
          return;
        }
      }
      // If all completed, show first lesson
      if (program.modules[0]?.lessons[0]) {
        setCurrentLesson(program.modules[0].lessons[0]);
        setOpenModules([program.modules[0].id]);
      }
    }
  }, [program]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectLesson = (lesson: LessonWithProgress) => {
    if (!hasAccess && !lesson.is_preview) {
      setShowPaymentModal(true);
      return;
    }
    setCurrentLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setIsMarkingComplete(true);
    await markLessonCompleted(currentLesson.id);
    setIsMarkingComplete(false);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!program) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-heading font-bold mb-2">
                Programa no encontrado
              </h2>
              <NeonButton onClick={() => navigate("/catalog")}>
                Ver Catálogo
              </NeonButton>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
                  onClick={() => navigate("/catalog")}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-heading font-bold text-lg">{program.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    {program.completedLessons}/{program.totalLessons} lecciones completadas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!hasAccess && !enrollmentLoading && (
                  <NeonButton size="sm" onClick={() => setShowPaymentModal(true)}>
                    <Lock className="w-4 h-4" />
                    Desbloquear ${program.price}
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

          {/* Locked Banner */}
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
                    videoUrl={currentLesson.video_url || ""}
                    title={currentLesson.title}
                  />

                  {/* Lesson Info */}
                  <HolographicCard className="space-y-4">
                    <div>
                      <h2 className="text-xl font-heading font-bold">
                        {currentLesson.title}
                      </h2>
                      {currentLesson.description && (
                        <p className="text-muted-foreground mt-1">
                          {currentLesson.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                      {hasAccess && !currentLesson.completed && (
                        <NeonButton
                          size="sm"
                          onClick={handleMarkComplete}
                          disabled={isMarkingComplete}
                        >
                          {isMarkingComplete ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Marcar como completada
                        </NeonButton>
                      )}
                      {currentLesson.completed && (
                        <span className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                          Completada
                        </span>
                      )}
                      {currentLesson.duration && (
                        <div className="flex items-center gap-1 ml-auto text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{currentLesson.duration}</span>
                        </div>
                      )}
                    </div>
                  </HolographicCard>

                  {/* Lesson Resources */}
                  <LessonResourceManager
                    lessonId={currentLesson.id}
                    resources={lessonResources}
                    onResourcesChange={refetchResources}
                    isAdmin={isAdmin}
                  />

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <HolographicCard className="text-center p-4">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold">{program.totalLessons}</div>
                      <div className="text-xs text-muted-foreground">Lecciones</div>
                    </HolographicCard>
                    <HolographicCard className="text-center p-4">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-secondary" />
                      <div className="text-lg font-bold">{program.completedLessons}</div>
                      <div className="text-xs text-muted-foreground">Completadas</div>
                    </HolographicCard>
                    <HolographicCard className="text-center p-4">
                      <Star className="w-6 h-6 mx-auto mb-2 text-accent" />
                      <div className="text-lg font-bold">{program.progress}%</div>
                      <div className="text-xs text-muted-foreground">Progreso</div>
                    </HolographicCard>
                    <HolographicCard className="text-center p-4">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold">{program.modules.length}</div>
                      <div className="text-xs text-muted-foreground">Módulos</div>
                    </HolographicCard>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96 rounded-2xl glass">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {program.modules.length === 0
                        ? "Este programa aún no tiene contenido"
                        : "Selecciona una lección para comenzar"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Sidebar */}
            {showSidebar && (
              <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">Contenido</h3>
                  <span className="text-sm text-muted-foreground">
                    {program.progress}% completado
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${program.progress}%` }}
                  />
                </div>

                {/* Modules */}
                <div className="space-y-2">
                  {program.modules.map((module, moduleIndex) => (
                    <ModuleAccordion
                      key={module.id}
                      module={module}
                      moduleIndex={moduleIndex}
                      isOpen={openModules.includes(module.id)}
                      onToggle={() => toggleModule(module.id)}
                      currentLessonId={currentLesson?.id}
                      onSelectLesson={handleSelectLesson}
                      hasAccess={hasAccess}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* PayPal Checkout */}
        <PayPalCheckout
          programId={courseId || ""}
          programTitle={program.title}
          price={program.price}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    </SidebarProvider>
  );
};

// Module Accordion Component
function ModuleAccordion({
  module,
  moduleIndex,
  isOpen,
  onToggle,
  currentLessonId,
  onSelectLesson,
  hasAccess,
}: {
  module: ModuleWithProgress;
  moduleIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  currentLessonId: string | undefined;
  onSelectLesson: (lesson: LessonWithProgress) => void;
  hasAccess: boolean;
}) {
  const completedInModule = module.lessons.filter((l) => l.completed).length;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <HolographicCard className="overflow-hidden p-0">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {moduleIndex + 1}
              </div>
              <div className="text-left">
                <h4 className="font-medium text-sm">{module.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {completedInModule}/{module.lessons.length} completadas
                </p>
              </div>
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border/50">
            {module.lessons.map((lesson, lessonIndex) => {
              const isLocked = !hasAccess && !lesson.is_preview;
              const isCurrent = lesson.id === currentLessonId;

              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors border-b border-border/30 last:border-0",
                    isCurrent && "bg-primary/10"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      lesson.completed
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      lessonIndex + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate",
                        isCurrent && "text-primary font-medium"
                      )}
                    >
                      {lesson.title}
                    </p>
                    {lesson.duration && (
                      <p className="text-xs text-muted-foreground">
                        {lesson.duration}
                      </p>
                    )}
                  </div>
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : lesson.is_preview ? (
                    <span className="text-xs text-secondary">Gratis</span>
                  ) : (
                    <Play className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </HolographicCard>
    </Collapsible>
  );
}

export default CoursePlayerPage;
