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
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                        isCurrent
                          ? "bg-primary/20 border border-primary/50"
                          : isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-white/5 cursor-pointer"
                      )}
                    >
                      {/* Status Icon */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          isCompleted
                            ? "bg-green-500/20 text-green-500"
                            : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : isLocked
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <h5
                          className={cn(
                            "font-medium truncate",
                            isCurrent && "text-primary"
                          )}
                        >
                          {lesson.title}
                        </h5>
                        <p className="text-xs text-muted-foreground truncate">
                          {lesson.duration}
                        </p>
                      </div>

                      {/* Playing indicator */}
                      {isCurrent && !isLocked && (
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                          <span className="w-1 h-2 bg-primary rounded-full animate-pulse delay-150" />
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
