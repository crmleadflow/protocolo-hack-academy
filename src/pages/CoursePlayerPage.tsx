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
type CardColumns = 2 | 3 | 4 | 5;

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
  const [cardColumns, setCardColumns] = useState<CardColumns>(3);
  
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

      {/* View Toggle & Column Selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Column Selector - Only visible in cards mode */}
        {displayMode === "cards" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Columnas:</span>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
              {([2, 3, 4, 5] as CardColumns[]).map((cols) => (
                <button
                  key={cols}
                  onClick={() => setCardColumns(cols)}
                  className={cn(
                    "w-7 h-7 rounded-md text-xs font-medium transition-all",
                    cardColumns === cols
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {displayMode === "list" && <div />}

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Vista:</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
            <button
              onClick={() => setDisplayMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                displayMode === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              title="Vista de lista"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMode("cards")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                displayMode === "cards"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
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
              columns={cardColumns}
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
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {moduleIndex + 1}
          </div>

          <div className="min-w-0 text-left flex-1">
            <h3 className="font-heading font-semibold leading-snug line-clamp-2 break-words">
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
          style={{ flexShrink: 0 }}
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
  columns,
}: {
  module: ModuleWithProgress;
  moduleIndex: number;
  hasAccess: boolean;
  onSelectLesson: (lesson: LessonWithProgress) => void;
  columns: CardColumns;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const completedLessons = module.lessons.filter((l) => l.completed).length;
  const totalLessons = module.lessons.length;

  // Grid classes - FORCE the selected column count on desktop, 
  // only collapse on mobile (< 640px)
  const gridClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {moduleIndex + 1}
          </div>

          <div className="min-w-0 text-left flex-1">
            <h3 className="font-heading font-semibold leading-snug line-clamp-2 break-words">
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
          style={{ flexShrink: 0 }}
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
              <div className={cn("grid gap-4", gridClasses[columns])}>
                {module.lessons.map((lesson, lessonIndex) => {
                  const isLocked = !hasAccess && !lesson.is_preview;
                  const isCompact = columns >= 4;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      disabled={isLocked}
                      className={cn(
                        "relative group aspect-square rounded-xl overflow-hidden text-left transition-all duration-300",
                        "bg-card/60 backdrop-blur-sm border border-border/40 flex flex-col",
                        isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                      )}
                    >
                      {/* Visual Background */}
                      <div className={cn(
                        "absolute inset-0 overflow-hidden",
                        lesson.completed 
                          ? "bg-gradient-to-br from-accent/20 via-accent/5 to-transparent"
                          : "bg-gradient-to-br from-primary/15 via-secondary/10 to-muted/10"
                      )}>
                        {/* Subtle pattern */}
                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-secondary/10 blur-xl" />
                      </div>

                      {/* Content overlay */}
                      <div className="relative flex flex-col h-full p-3">
                        {/* Top row: Number + Status */}
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "rounded-lg bg-background/80 backdrop-blur-sm font-bold flex items-center justify-center shadow-sm border border-border/30",
                            isCompact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"
                          )}>
                            {lessonIndex + 1}
                          </div>

                          {/* Status Icon */}
                          <div>
                            {lesson.completed ? (
                              <div className={cn(
                                "rounded-full bg-accent flex items-center justify-center shadow-sm",
                                isCompact ? "w-5 h-5" : "w-6 h-6"
                              )}>
                                <CheckCircle2 className={cn("text-accent-foreground", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                              </div>
                            ) : lesson.is_preview ? (
                              <div className={cn(
                                "rounded-full bg-primary/90 text-primary-foreground font-medium shadow-sm flex items-center justify-center",
                                isCompact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
                              )}>
                                Gratis
                              </div>
                            ) : isLocked ? (
                              <div className={cn(
                                "rounded-full bg-muted/80 flex items-center justify-center",
                                isCompact ? "w-5 h-5" : "w-6 h-6"
                              )}>
                                <Lock className={cn("text-muted-foreground", isCompact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Center: Play button on hover */}
                        <div className="flex-1 flex items-center justify-center">
                          {!isLocked && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <div className={cn(
                                "rounded-full bg-primary flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform",
                                isCompact ? "w-10 h-10" : "w-12 h-12"
                              )}>
                                <Play className={cn("text-primary-foreground ml-0.5", isCompact ? "w-4 h-4" : "w-5 h-5")} fill="currentColor" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom: Title + Duration - CONTAINED within card width */}
                        <div className="mt-auto w-full min-w-0 overflow-hidden">
                          <h4 
                            className={cn(
                              // Force text to stay within card: truncate + ellipsis
                              "font-medium leading-tight truncate",
                              isCompact ? "text-[10px]" : "text-xs",
                              lesson.completed ? "text-muted-foreground" : "text-foreground"
                            )}
                            title={lesson.title}
                          >
                            {lesson.title}
                          </h4>

                          {/* Keep a fixed row for duration so title alignment doesn't jump */}
                          <div
                            className={cn(
                              "mt-1 flex items-center gap-1 text-muted-foreground",
                              isCompact ? "text-[9px]" : "text-[10px]",
                              !lesson.duration && "opacity-0"
                            )}
                            aria-hidden={!lesson.duration}
                          >
                            <Clock className={cn(isCompact ? "w-2 h-2" : "w-2.5 h-2.5")} />
                            <span>{lesson.duration ?? ""}</span>
                          </div>
                        </div>
                      </div>
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

      {/* Video Player Card - sized to video aspect ratio */}
      <div className="w-full max-w-4xl mx-auto">
        <HolographicCard
          variant="gradient"
          hover={false}
          className="p-3 lg:p-4 overflow-hidden"
        >
          <div className="space-y-2">
            {/* Lesson Title */}
            <div className="min-w-0">
              <h2 className="text-lg lg:text-xl font-heading font-bold text-foreground break-words line-clamp-2">
                {currentLesson.title}
              </h2>
              {currentLesson.description && (
                <p className="text-muted-foreground mt-1 text-xs lg:text-sm line-clamp-1">
                  {currentLesson.description}
                </p>
              )}
            </div>

            {/* Video Player */}
            <VideoPlayer
              videoUrl={currentLesson.video_url || ""}
              title={currentLesson.title}
            />
          </div>
        </HolographicCard>
      </div>

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

      {/* Three columns: Mentor | Resources | Comments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

    </div>
  );
}

export default CoursePlayerPage;
