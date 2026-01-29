import React from "react";
import { Play, Lock, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoModule, DemoLesson } from "@/data/demo-data";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LessonListProps {
  modules: DemoModule[];
  currentLessonId: string;
  onSelectLesson: (lesson: DemoLesson) => void;
  hasAccess?: boolean;
}

export const LessonList: React.FC<LessonListProps> = ({
  modules,
  currentLessonId,
  onSelectLesson,
  hasAccess = true,
}) => {
  const [openModules, setOpenModules] = React.useState<string[]>([modules[0]?.id]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="space-y-2">
      {modules.map((module, moduleIndex) => {
        const isOpen = openModules.includes(module.id);
        const completedLessons = module.lessons.filter((l) => l.completed).length;
        const totalLessons = module.lessons.length;

        return (
          <Collapsible
            key={module.id}
            open={isOpen}
            onOpenChange={() => toggleModule(module.id)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/5 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {moduleIndex + 1}
                  </div>
                  <div className="text-left">
                    <h4 className="font-heading font-semibold">{module.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {completedLessons}/{totalLessons} lecciones completadas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress indicator */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((completedLessons / totalLessons) * 100)}%
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="ml-4 mt-2 space-y-1">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isCurrent = lesson.id === currentLessonId;
                  // First lesson is always preview, rest require access
                  const isLocked = !hasAccess && lessonIndex > 0;
                  const isCompleted = lesson.completed;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      disabled={isLocked}
                      className={cn(
                        "w-full flex items-center gap-3 py-2.5 px-2 transition-all text-left group relative",
                        isCurrent
                          ? "text-primary"
                          : isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:text-primary cursor-pointer"
                      )}
                    >
                      {/* Left border indicator for current */}
                      {isCurrent && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />
                      )}

                      {/* Completion/Status indicator */}
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 group-hover:bg-primary/60 transition-colors" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <h5
                          className={cn(
                            "text-sm transition-colors truncate",
                            isCompleted && "text-muted-foreground",
                            isCurrent && "font-medium text-primary"
                          )}
                        >
                          {lesson.title}
                        </h5>
                      </div>

                      {/* Duration */}
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {lesson.duration}
                      </span>

                      {/* Playing indicator */}
                      {isCurrent && !isLocked && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <span className="w-0.5 h-2.5 bg-primary rounded-full animate-pulse" />
                          <span className="w-0.5 h-3.5 bg-primary rounded-full animate-pulse delay-75" />
                          <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse delay-150" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};
