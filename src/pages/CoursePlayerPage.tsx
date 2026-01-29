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
      {displayMode === "list" ? (
        // List mode: stacked modules
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
        </div>
      ) : (
        // Card mode: modules as cards in a grid
        <ModulesCardGrid
          modules={program.modules}
          hasAccess={hasAccess}
          onSelectLesson={onSelectLesson}
          columns={cardColumns}
        />
      )}

      {program.modules.length === 0 && (
        <HolographicCard className="p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Este programa aún no tiene contenido
          </p>
        </HolographicCard>
      )}
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

// Modules Card Grid - Shows modules as cards in a grid
function ModulesCardGrid({
  modules,
  hasAccess,
  onSelectLesson,
  columns,
}: {
  modules: ModuleWithProgress[];
  hasAccess: boolean;
  onSelectLesson: (lesson: LessonWithProgress) => void;
  columns: CardColumns;
}) {
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Grid classes for modules (2 columns by default)
  const moduleGridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  const lessonGridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className="space-y-6">
      {/* Modules Grid */}
      <div className={cn("grid gap-6", moduleGridClasses[columns])}>
        {modules.map((module, moduleIndex) => {
          const completedLessons = module.lessons.filter((l) => l.completed).length;
          const totalLessons = module.lessons.length;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          const isExpanded = expandedModuleId === module.id;

          return (
            <button
              key={module.id}
              onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
              className={cn(
                "group text-left transition-all duration-300 rounded-xl overflow-hidden flex flex-col",
                "bg-card/60 backdrop-blur-sm border border-border/40",
                "hover-lift",
                isExpanded ? "border-primary/50 ring-2 ring-primary/20" : "hover:border-primary/50"
              )}
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-primary/20 to-muted/20">
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-secondary/20 blur-3xl" />
                  <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-primary/20 blur-2xl" />
                </div>

                {/* Module Number in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-heading font-bold text-white/20">
                    {String(moduleIndex + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Expand indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30 transform scale-90 group-hover:scale-100 transition-transform">
                    <ChevronDown className={cn("w-6 h-6 text-secondary-foreground transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </div>

                {/* Progress Badge */}
                {progress > 0 && (
                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1",
                      progress === 100 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-primary/90 text-primary-foreground"
                    )}>
                      {progress === 100 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Completo
                        </>
                      ) : (
                        `${progress}%`
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {module.title}
                </h4>

                {module.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                    {module.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-auto">
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {totalLessons} lecciones
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {completedLessons}/{totalLessons}
                  </span>
                </div>

                {/* Mini progress bar */}
                {progress > 0 && progress < 100 && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Module Lessons */}
      {expandedModuleId && (
        <div className="animate-fade-in">
          {modules
            .filter((m) => m.id === expandedModuleId)
            .map((module) => (
              <div key={module.id} className="rounded-xl border border-primary/30 bg-card/40 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-lg">{module.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedModuleId(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
                
                {module.lessons.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">Sin lecciones</div>
                ) : (
                  <div className={cn("grid gap-4", lessonGridClasses[columns])}>
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isLocked = !hasAccess && !lesson.is_preview;

                      return (
                        <button
                          key={lesson.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLocked) onSelectLesson(lesson);
                          }}
                          disabled={isLocked}
                          className={cn(
                            "group/lesson text-left transition-all duration-300 rounded-xl overflow-hidden flex flex-col",
                            "bg-card/60 backdrop-blur-sm border border-border/40",
                            isLocked
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:border-primary/50 hover:-translate-y-0.5"
                          )}
                        >
                          {/* Lesson Thumbnail */}
                          <div className="relative aspect-video overflow-hidden bg-muted">
                            <div className={cn(
                              "absolute inset-0",
                              lesson.completed 
                                ? "bg-gradient-to-br from-accent/30 via-accent/10 to-primary/10"
                                : "bg-gradient-to-br from-primary/20 via-secondary/15 to-muted/20"
                            )}>
                              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/20 blur-2xl" />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-heading font-bold text-white/20">
                                {String(lessonIndex + 1).padStart(2, '0')}
                              </span>
                            </div>

                            {!isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/lesson:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
                                </div>
                              </div>
                            )}

                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}

                            <div className="absolute top-2 right-2">
                              {lesson.completed && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                </span>
                              )}
                              {lesson.is_preview && !lesson.completed && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/90 text-primary-foreground">
                                  Gratis
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3">
                            <h5 className="font-medium text-xs group-hover/lesson:text-primary transition-colors line-clamp-2">
                              {lesson.title}
                            </h5>
                            {lesson.duration && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="w-2.5 h-2.5" />
                                {lesson.duration}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
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

  // Grid classes - 2 columns on desktop like catalog
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
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
              <div className={cn("grid gap-6", gridClasses[columns])}>
                {module.lessons.map((lesson, lessonIndex) => {
                  const isLocked = !hasAccess && !lesson.is_preview;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      disabled={isLocked}
                      className={cn(
                        "group text-left transition-all duration-300 rounded-xl overflow-hidden flex flex-col",
                        "bg-card/60 backdrop-blur-sm border border-border/40",
                        "hover-lift",
                        isLocked
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:border-primary/50"
                      )}
                    >
                      {/* Thumbnail Area */}
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {/* Visual gradient background */}
                        <div className={cn(
                          "absolute inset-0",
                          lesson.completed 
                            ? "bg-gradient-to-br from-accent/30 via-accent/10 to-primary/10"
                            : "bg-gradient-to-br from-primary/20 via-secondary/15 to-muted/20"
                        )}>
                          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
                          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-secondary/20 blur-2xl" />
                        </div>

                        {/* Lesson Number in Center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-heading font-bold text-white/20">
                            {String(lessonIndex + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Play button on hover */}
                        {!isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-sm">
                            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transform scale-90 group-hover:scale-100 transition-transform">
                              <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        )}

                        {/* Lock overlay for locked lessons */}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-full bg-muted/80 flex items-center justify-center">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {lesson.completed ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground flex items-center gap-1 backdrop-blur-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              Completada
                            </span>
                          ) : lesson.is_preview ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm">
                              Gratis
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 flex flex-col flex-1">
                        {/* Title */}
                        <h4 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {lesson.title}
                        </h4>

                        {/* Description placeholder or duration */}
                        <div className="flex-1" />

                        {/* Meta info */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-2">
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Lección {lessonIndex + 1}
                          </span>
                          {lesson.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
                          )}
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
