import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Clock, Users, 
  CheckCircle2, Lock, Loader2, Play, List,
  ChevronLeft, ChevronRight, ChevronDown, SkipForward,
  LayoutGrid, LayoutList
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { PayPalCheckout } from "@/components/payment/PayPalCheckout";
import { LessonResourceManager } from "@/components/lesson/LessonResourceManager";
import { LessonCommentsSection } from "@/components/lesson/LessonCommentsSection";
import { LessonMentorQuestion } from "@/components/lesson/LessonMentorQuestion";

import { useStudentProgramDetail, LessonWithProgress, ModuleWithProgress } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useLessonResources } from "@/hooks/useLessonResources";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "lesson";
type ListDisplayMode = "list" | "cards";

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
  const [displayMode, setDisplayMode] = useState<ListDisplayMode>("list");
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
        </div>
      </HolographicCard>

      {/* View Toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground mr-2">Vista:</span>
        <button
          onClick={() => setDisplayMode("list")}
          className={cn(
            "p-2 rounded-lg transition-all",
            displayMode === "list" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
          title="Vista de lista"
        >
          <LayoutList className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDisplayMode("cards")}
          className={cn(
            "p-2 rounded-lg transition-all",
            displayMode === "cards" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
          title="Vista de tarjetas"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      {/* Modules and Lessons - List or Cards */}
      <div className="space-y-4">
        {program.modules.map((module: ModuleWithProgress, moduleIndex: number) => (
          displayMode === "list" ? (
            <ModuleLessonList
              key={module.id}
              module={module}
              moduleIndex={moduleIndex}
              hasAccess={hasAccess}
              onSelectLesson={onSelectLesson}
            />
          ) : (
            <ModuleLessonCards
              key={module.id}
              module={module}
              moduleIndex={moduleIndex}
              hasAccess={hasAccess}
              onSelectLesson={onSelectLesson}
            />
          )
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
  const completedLessons = module.lessons.filter((l) => l.completed).length;
  const totalLessons = module.lessons.length;

  return (
    <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {moduleIndex + 1}
          </div>

          <div className="min-w-0 text-left">
            <h3 className="font-heading font-semibold leading-snug truncate">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {module.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{completedLessons}/{totalLessons} completadas</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{totalLessons} lecciones</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-0.5 w-9 h-9 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center transition-transform",
            isExpanded && "rotate-180"
          )}
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      {/* Lessons */}
      <div
        className={cn(
          "grid transition-all duration-300",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-border/50">
            {module.lessons.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">Sin lecciones</div>
            ) : (
              module.lessons.map((lesson) => {
                const isLocked = !hasAccess && !lesson.is_preview;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && onSelectLesson(lesson)}
                    disabled={isLocked}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      isLocked
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-muted/20"
                    )}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "text-sm truncate",
                            lesson.completed && "text-muted-foreground"
                          )}
                        >
                          {lesson.title}
                        </span>
                        {lesson.is_preview && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                            Gratis
                          </Badge>
                        )}
                      </div>
                    </div>

                    {lesson.completed && (
                      <Badge variant="secondary" className="text-[10px] h-5 flex-shrink-0">
                        Completada
                      </Badge>
                    )}

                    {lesson.duration && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {lesson.duration}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Module with Lessons Cards Component (Card View)
function ModuleLessonCards({
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
  const completedLessons = module.lessons.filter((l) => l.completed).length;
  const totalLessons = module.lessons.length;

  return (
    <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {moduleIndex + 1}
          </div>

          <div className="min-w-0 text-left">
            <h3 className="font-heading font-semibold leading-snug truncate">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {module.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{completedLessons}/{totalLessons} completadas</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{totalLessons} lecciones</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-0.5 w-9 h-9 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center transition-transform",
            isExpanded && "rotate-180"
          )}
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      {/* Lesson Cards Grid */}
      <div
        className={cn(
          "grid transition-all duration-300",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            {module.lessons.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">Sin lecciones</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isLocked = !hasAccess && !lesson.is_preview;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      disabled={isLocked}
                      className={cn(
                        "relative group rounded-2xl overflow-hidden text-left transition-all duration-300",
                        "bg-gradient-to-br from-card/80 to-card/40 border border-border/30",
                        "shadow-lg shadow-black/5",
                        isLocked
                          ? "opacity-60 cursor-not-allowed grayscale"
                          : "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40"
                      )}
                    >
                      {/* Thumbnail/Visual Area */}
                      <div className={cn(
                        "relative h-28 overflow-hidden",
                        "bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"
                      )}>
                        {/* Decorative Pattern */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
                          <div className="absolute bottom-2 left-2 w-16 h-16 rounded-full bg-secondary/20 blur-xl" />
                        </div>
                        
                        {/* Lesson Number */}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-background/90 backdrop-blur-sm text-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                          {lessonIndex + 1}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {lesson.completed ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium shadow-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completada</span>
                            </div>
                          ) : lesson.is_preview ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium shadow-lg">
                              <Play className="w-3 h-3" />
                              <span>Gratis</span>
                            </div>
                          ) : isLocked ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/90 text-muted-foreground text-xs font-medium shadow-lg backdrop-blur-sm">
                              <Lock className="w-3 h-3" />
                              <span>Bloqueada</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Play Button Overlay */}
                        <div className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          "opacity-0 group-hover:opacity-100 transition-all duration-300",
                          isLocked && "hidden"
                        )}>
                          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4">
                        <h4 className={cn(
                          "font-heading font-semibold text-sm line-clamp-2 leading-snug",
                          lesson.completed ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {lesson.title}
                        </h4>
                        
                        {lesson.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {lesson.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                          {lesson.duration ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{lesson.duration}</span>
                            </div>
                          ) : (
                            <div />
                          )}
                          
                          {!isLocked && !lesson.completed && (
                            <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Ver lección</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl pointer-events-none",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-t from-primary/5 via-transparent to-transparent",
                        isLocked && "hidden"
                      )} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
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

      {/* Lesson Title Above Video */}
      <div className="mb-2">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          {currentLesson.title}
        </h2>
        {currentLesson.description && (
          <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
            {currentLesson.description}
          </p>
        )}
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

      {/* Mentor Question Section */}
      {hasAccess && (
        <LessonMentorQuestion
          lessonTitle={currentLesson.title}
          programTitle={program.title}
        />
      )}

      {/* Lesson Resources */}
      <LessonResourceManager
        lessonId={currentLesson.id}
        resources={lessonResources}
        onResourcesChange={refetchResources}
        isAdmin={false}
      />

      {/* Comments Section */}
      {hasAccess && (
        <LessonCommentsSection
          lessonId={currentLesson.id}
          lessonTitle={currentLesson.title}
        />
      )}

    </div>
  );
}

export default CoursePlayerPage;
