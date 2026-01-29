import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Clock, Users, Star, 
  CheckCircle2, Lock, Loader2, Play, List,
  ChevronLeft, ChevronRight, SkipForward
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { PayPalCheckout } from "@/components/payment/PayPalCheckout";
import { LessonResourceManager } from "@/components/lesson/LessonResourceManager";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useStudentProgramDetail, LessonWithProgress, ModuleWithProgress } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useLessonResources } from "@/hooks/useLessonResources";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "lesson";

const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { program, isLoading, markLessonCompleted } = useStudentProgramDetail(courseId);
  const { hasActiveEnrollment, isLoading: enrollmentLoading } = useEnrollment(courseId);

  // Admin always has access
  const hasAccess = isAdmin || hasActiveEnrollment;

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  
  // Fetch resources for current lesson
  const { resources: lessonResources, refetch: refetchResources } = useLessonResources(currentLesson?.id);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Flatten all lessons for navigation
  const allLessons = useMemo(() => {
    if (!program) return [];
    return program.modules.flatMap((module) => module.lessons);
  }, [program]);

  // Get current lesson index and navigation info
  const currentLessonIndex = useMemo(() => {
    if (!currentLesson) return -1;
    return allLessons.findIndex((l) => l.id === currentLesson.id);
  }, [currentLesson, allLessons]);

  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleSelectLesson = (lesson: LessonWithProgress) => {
    if (!hasAccess && !lesson.is_preview) {
      setShowPaymentModal(true);
      return;
    }
    setCurrentLesson(lesson);
    setViewMode("lesson");
  };

  const handleBackToList = () => {
    setViewMode("list");
  };

  const handlePreviousLesson = () => {
    if (previousLesson) {
      handleSelectLesson(previousLesson);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      handleSelectLesson(nextLesson);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setIsMarkingComplete(true);
    await markLessonCompleted(currentLesson.id);
    setIsMarkingComplete(false);
  };

  const handleMarkCompleteAndNext = async () => {
    if (!currentLesson) return;
    setIsMarkingComplete(true);
    await markLessonCompleted(currentLesson.id);
    setIsMarkingComplete(false);
    if (nextLesson) {
      handleSelectLesson(nextLesson);
    }
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
                {viewMode === "lesson" ? (
                  <button
                    onClick={handleBackToList}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <List className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Menú de Lecciones</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/catalog")}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
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

          {/* Content based on view mode */}
          {viewMode === "list" ? (
            <LessonListView
              program={program}
              hasAccess={hasAccess}
              onSelectLesson={handleSelectLesson}
            />
          ) : (
            <LessonPlayerView
              program={program}
              currentLesson={currentLesson}
              currentLessonIndex={currentLessonIndex}
              totalLessons={allLessons.length}
              lessonResources={lessonResources}
              refetchResources={refetchResources}
              hasAccess={hasAccess}
              isAdmin={isAdmin}
              isMarkingComplete={isMarkingComplete}
              onMarkComplete={handleMarkComplete}
              onMarkCompleteAndNext={handleMarkCompleteAndNext}
              onBackToList={handleBackToList}
              onPreviousLesson={handlePreviousLesson}
              onNextLesson={handleNextLesson}
              hasPrevious={!!previousLesson}
              hasNext={!!nextLesson}
              nextLessonTitle={nextLesson?.title}
            />
          )}
        </main>

        {/* PayPal Checkout */}
        <PayPalCheckout
          programId={courseId || ""}
          programTitle={program.title}
          programThumbnail={program.thumbnail_url}
          price={program.price}
          totalLessons={program.totalLessons}
          totalModules={program.modules.length}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    </SidebarProvider>
  );
};

// Lesson List View Component
function LessonListView({
  program,
  hasAccess,
  onSelectLesson,
}: {
  program: any;
  hasAccess: boolean;
  onSelectLesson: (lesson: LessonWithProgress) => void;
}) {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Program Header Card */}
      <HolographicCard variant="gradient" className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Thumbnail */}
          <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {program.thumbnail_url ? (
              <img
                src={program.thumbnail_url}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Program Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-heading font-bold mb-2">{program.title}</h2>
            {program.description && (
              <p className="text-muted-foreground text-sm mb-4">{program.description}</p>
            )}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{program.totalLessons} lecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{program.modules.length} módulos</span>
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing progress={program.progress} size={80} strokeWidth={6}>
              <span className="text-lg font-bold">{program.progress}%</span>
            </ProgressRing>
          </div>
        </div>
      </HolographicCard>

      {/* Modules and Lessons List */}
      <div className="space-y-4">
        {program.modules.map((module: ModuleWithProgress, moduleIndex: number) => (
          <ModuleLessonList
            key={module.id}
            module={module}
            moduleIndex={moduleIndex}
            hasAccess={hasAccess}
            onSelectLesson={onSelectLesson}
          />
        ))}

        {program.modules.length === 0 && (
          <HolographicCard className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Este programa aún no tiene contenido
            </p>
          </HolographicCard>
        )}
      </div>
    </div>
  );
}

// Module with Lessons List Component
function ModuleLessonList({
  module,
  moduleIndex,
  hasAccess,
  onSelectLesson,
}: {
  module: ModuleWithProgress;
  moduleIndex: number;
  hasAccess: boolean;
  onSelectLesson: (lesson: LessonWithProgress) => void;
}) {
  const completedInModule = module.lessons.filter((l) => l.completed).length;
  const moduleProgress = module.lessons.length > 0 
    ? Math.round((completedInModule / module.lessons.length) * 100) 
    : 0;

  return (
    <HolographicCard className="overflow-hidden p-0">
      {/* Module Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
            {moduleIndex + 1}
          </div>
          <div>
            <h3 className="font-heading font-semibold">{module.title}</h3>
            {module.description && (
              <p className="text-xs text-muted-foreground">{module.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{completedInModule}/{module.lessons.length}</span>
          <ProgressRing progress={moduleProgress} size={32} strokeWidth={3}>
            <CheckCircle2 className={cn(
              "w-3 h-3",
              moduleProgress === 100 ? "text-primary" : "text-muted-foreground"
            )} />
          </ProgressRing>
        </div>
      </div>

      {/* Lessons */}
      <div className="divide-y divide-border/30">
        {module.lessons.map((lesson, lessonIndex) => {
          const isLocked = !hasAccess && !lesson.is_preview;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-all group"
            >
              {/* Completion Circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    lesson.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-transparent border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50"
                  )}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-semibold">{lessonIndex + 1}</span>
                  )}
                </div>
              </div>

              {/* Lesson Info */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium group-hover:text-primary transition-colors",
                  lesson.completed && "text-primary"
                )}>
                  {lesson.title}
                </h4>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {lesson.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration}
                    </span>
                  )}
                  {lesson.is_preview && (
                    <span className="text-secondary font-medium">Vista previa</span>
                  )}
                  {lesson.completed && (
                    <span className="text-primary font-medium">Completada</span>
                  )}
                </div>
              </div>

              {/* Play Button */}
              <div className="flex-shrink-0">
                {isLocked ? (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Play className="w-5 h-5 text-primary group-hover:text-primary-foreground ml-0.5" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </HolographicCard>
  );
}

// Lesson Player View Component
function LessonPlayerView({
  program,
  currentLesson,
  currentLessonIndex,
  totalLessons,
  lessonResources,
  refetchResources,
  hasAccess,
  isAdmin,
  isMarkingComplete,
  onMarkComplete,
  onMarkCompleteAndNext,
  onBackToList,
  onPreviousLesson,
  onNextLesson,
  hasPrevious,
  hasNext,
  nextLessonTitle,
}: {
  program: any;
  currentLesson: LessonWithProgress | null;
  currentLessonIndex: number;
  totalLessons: number;
  lessonResources: any[];
  refetchResources: () => void;
  hasAccess: boolean;
  isAdmin: boolean;
  isMarkingComplete: boolean;
  onMarkComplete: () => void;
  onMarkCompleteAndNext: () => void;
  onBackToList: () => void;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  nextLessonTitle?: string;
}) {
  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl glass m-6">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Selecciona una lección para comenzar</p>
          <NeonButton className="mt-4" onClick={onBackToList}>
            <List className="w-4 h-4" />
            Ver listado de lecciones
          </NeonButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Lesson Progress Indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Lección {currentLessonIndex + 1} de {totalLessons}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
              style={{ width: `${((currentLessonIndex + 1) / totalLessons) * 100}%` }}
            />
          </div>
          <span className="text-primary font-medium">
            {Math.round(((currentLessonIndex + 1) / totalLessons) * 100)}%
          </span>
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        videoUrl={currentLesson.video_url || ""}
        title={currentLesson.title}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <NeonButton
          variant="ghost"
          size="sm"
          onClick={onPreviousLesson}
          disabled={!hasPrevious}
          className={cn(!hasPrevious && "opacity-50 cursor-not-allowed")}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </NeonButton>

        <div className="flex-1 flex justify-center">
          {hasAccess && !currentLesson.completed && hasNext && (
            <NeonButton
              onClick={onMarkCompleteAndNext}
              disabled={isMarkingComplete}
              className="gap-2"
            >
              {isMarkingComplete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SkipForward className="w-4 h-4" />
              )}
              Completar y Continuar
            </NeonButton>
          )}
          {hasAccess && !currentLesson.completed && !hasNext && (
            <NeonButton
              onClick={onMarkComplete}
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
            <span className="flex items-center gap-2 text-sm text-primary font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Lección Completada
            </span>
          )}
        </div>

        <NeonButton
          variant="ghost"
          size="sm"
          onClick={onNextLesson}
          disabled={!hasNext}
          className={cn(!hasNext && "opacity-50 cursor-not-allowed")}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </NeonButton>
      </div>

      {/* Next Lesson Preview */}
      {hasNext && nextLessonTitle && (
        <button
          onClick={onNextLesson}
          className="w-full p-4 rounded-xl glass hover:bg-white/5 transition-all group text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Siguiente lección</span>
              <h4 className="font-medium group-hover:text-primary transition-colors">
                {nextLessonTitle}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
              <Play className="w-5 h-5 text-primary group-hover:text-primary-foreground ml-0.5" />
            </div>
          </div>
        </button>
      )}

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
          <NeonButton variant="ghost" size="sm" onClick={onBackToList}>
            <List className="w-4 h-4" />
            Volver al listado
          </NeonButton>
          
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
    </div>
  );
}

export default CoursePlayerPage;
