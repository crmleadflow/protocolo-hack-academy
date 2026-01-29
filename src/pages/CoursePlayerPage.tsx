import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Clock, Users, Star, 
  CheckCircle2, Lock, Loader2, Play, List,
  ChevronLeft, ChevronRight, ChevronDown, SkipForward
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
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
      <SidebarProvider defaultOpen={false}>
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
      <SidebarProvider defaultOpen={false}>
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
    <SidebarProvider defaultOpen={false}>
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
        
        {/* Floating button for mobile */}
        <FloatingSidebarTrigger />
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
  const [isExpanded, setIsExpanded] = useState(true);
  const completedInModule = module.lessons.filter((l) => l.completed).length;
  const moduleProgress = module.lessons.length > 0 
    ? Math.round((completedInModule / module.lessons.length) * 100) 
    : 0;

  return (
    <div className="relative">
      {/* Module Card */}
      <HolographicCard className="overflow-hidden p-0 transition-all duration-300">
        {/* Module Header - Clickable */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            {/* Animated Module Number */}
            <div className="relative">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-500",
                moduleProgress === 100 
                  ? "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/30" 
                  : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
              )}>
                {moduleProgress === 100 ? (
                  <CheckCircle2 className="w-7 h-7 animate-pulse" />
                ) : (
                  moduleIndex + 1
                )}
              </div>
              {/* Progress ring around number */}
              <svg className="absolute inset-0 w-14 h-14 -rotate-90">
                <circle
                  className="text-muted/30"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                  r="24"
                  cx="28"
                  cy="28"
                />
                <circle
                  className="text-primary transition-all duration-700 ease-out"
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="24"
                  cx="28"
                  cy="28"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 24}`,
                    strokeDashoffset: `${2 * Math.PI * 24 * (1 - moduleProgress / 100)}`,
                  }}
                />
              </svg>
            </div>
            
            <div className="text-left">
              <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              {module.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {module.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {module.lessons.length} lecciones
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  moduleProgress === 100 
                    ? "bg-accent/20 text-accent" 
                    : "bg-muted/50 text-muted-foreground"
                )}>
                  {completedInModule}/{module.lessons.length} completadas
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress percentage */}
            <div className="hidden sm:flex flex-col items-end">
              <span className={cn(
                "text-2xl font-bold transition-colors",
                moduleProgress === 100 ? "text-primary" : "text-muted-foreground"
              )}>
                {moduleProgress}%
              </span>
              <div className="w-24 h-2 bg-muted/30 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${moduleProgress}%` }}
                />
              </div>
            </div>
            
            {/* Expand/Collapse Icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-300",
              isExpanded ? "rotate-180" : ""
            )}>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </button>

        {/* Lessons - Animated expand/collapse */}
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="p-2">
            {module.lessons.map((lesson, lessonIndex) => {
              const isLocked = !hasAccess && !lesson.is_preview;
              const progressPercent = lesson.completed ? 100 : 0;

              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 text-left rounded-xl transition-all duration-300 group relative overflow-hidden",
                    "hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent",
                    lesson.completed && "bg-primary/5"
                  )}
                  style={{
                    animationDelay: `${lessonIndex * 50}ms`
                  }}
                >
                  {/* Subtle background progress indicator */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent transition-all duration-500 pointer-events-none"
                    style={{ width: `${progressPercent}%`, opacity: lesson.completed ? 1 : 0 }}
                  />
                  
                  {/* Lesson Number/Status */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                        lesson.completed
                          ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/20"
                          : isLocked
                          ? "bg-muted/50 text-muted-foreground"
                          : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30"
                      )}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <>
                          <span className="font-bold group-hover:hidden">{lessonIndex + 1}</span>
                          <Play className="w-5 h-5 hidden group-hover:block ml-0.5" />
                        </>
                      )}
                    </div>
                    
                    {/* Connecting line to next lesson */}
                    {lessonIndex < module.lessons.length - 1 && (
                      <div className={cn(
                        "absolute top-full left-1/2 w-0.5 h-4 -translate-x-1/2 transition-colors duration-300",
                        lesson.completed ? "bg-accent/50" : "bg-muted/30"
                      )} />
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-medium transition-colors line-clamp-1",
                        lesson.completed ? "text-primary" : "group-hover:text-primary"
                      )}>
                        {lesson.title}
                      </h4>
                      {lesson.is_preview && (
                        <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold uppercase tracking-wider">
                          Gratis
                        </span>
                      )}
                    </div>
                    
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {lesson.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2">
                      {lesson.duration && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.duration}
                        </span>
                      )}
                      
                      {/* Progress indicator for individual lesson */}
                      {lesson.completed ? (
                        <span className="flex items-center gap-1.5 text-xs text-accent font-medium">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Completada
                        </span>
                      ) : !isLocked && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          <Play className="w-3.5 h-3.5" />
                          Reproducir
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action indicator */}
                  <div className="flex-shrink-0 z-10">
                    {isLocked ? (
                      <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        lesson.completed 
                          ? "bg-accent/20" 
                          : "bg-primary/10 group-hover:bg-primary group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30"
                      )}>
                        {lesson.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </HolographicCard>
    </div>
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
      {/* Always show student view for resources - no admin buttons in course player */}
      <LessonResourceManager
        lessonId={currentLesson.id}
        resources={lessonResources}
        onResourcesChange={refetchResources}
        isAdmin={false}
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
