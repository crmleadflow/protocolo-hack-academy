import React, { useState } from "react";
import { 
  ChevronDown, ChevronUp, User, Check, X, 
  BookOpen, Loader2, ToggleLeft, ToggleRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProgramEnrollment {
  id: string | null;
  program_id: string;
  program_title: string;
  status: "active" | "pending" | "expired" | "cancelled" | null;
  enrolled_at: string | null;
  is_manual: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export interface StudentWithEnrollments {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  enrollments: ProgramEnrollment[];
}

interface StudentEnrollmentCardProps {
  student: StudentWithEnrollments;
  allPrograms: { id: string; title: string }[];
  onToggleEnrollment: (
    studentId: string, 
    programId: string, 
    enrollmentId: string | null,
    currentStatus: "active" | null
  ) => Promise<void>;
  onToggleAllPrograms: (
    studentId: string, 
    activate: boolean
  ) => Promise<void>;
  isUpdating: string | null;
}

const StudentEnrollmentCard: React.FC<StudentEnrollmentCardProps> = ({
  student,
  allPrograms,
  onToggleEnrollment,
  onToggleAllPrograms,
  isUpdating,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get all programs with their enrollment status for this student
  const programsWithStatus = allPrograms.map((program) => {
    const enrollment = student.enrollments.find(
      (e) => e.program_id === program.id
    );
    return {
      ...program,
      enrollment,
      isActive: enrollment?.status === "active",
    };
  });

  const activeCount = programsWithStatus.filter((p) => p.isActive).length;
  const allActive = activeCount === allPrograms.length;
  const someActive = activeCount > 0 && !allActive;

  return (
    <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/30">
      {/* Student Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
            {student.full_name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {student.full_name || "Sin nombre"}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {student.user_id.slice(0, 8)}...
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">
                {activeCount} de {allPrograms.length}
              </div>
              <div className="text-xs text-muted-foreground">
                programas activos
              </div>
            </div>

            {/* Master Toggle */}
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Todos
              </span>
              {isUpdating === `all-${student.user_id}` ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Switch
                  checked={allActive}
                  onCheckedChange={(checked) => 
                    onToggleAllPrograms(student.user_id, checked)
                  }
                  className={cn(
                    someActive && "data-[state=unchecked]:bg-primary/40"
                  )}
                />
              )}
            </div>

            {/* Expand Button */}
            <Button variant="ghost" size="sm" className="shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content - Programs List */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Programas y Progreso
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Activo
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Inactivo
                </div>
              </div>
            </div>

            {programsWithStatus.map((program) => {
              const updateKey = `${student.user_id}-${program.id}`;
              const isThisUpdating = isUpdating === updateKey;
              
              return (
                <div 
                  key={program.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    program.isActive 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border/30 bg-card/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Indicator */}
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full shrink-0",
                        program.isActive ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />

                    {/* Program Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium text-sm truncate",
                          !program.isActive && "text-muted-foreground"
                        )}>
                          {program.title}
                        </span>
                        {program.enrollment?.is_manual && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Manual
                          </Badge>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {program.enrollment && (
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={program.enrollment.progress} 
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {program.enrollment.completedLessons}/{program.enrollment.totalLessons} lecciones
                          </span>
                        </div>
                      )}
                      
                      {!program.enrollment && (
                        <span className="text-xs text-muted-foreground">
                          Sin inscripción
                        </span>
                      )}
                    </div>

                    {/* Toggle Switch */}
                    <div className="shrink-0 flex items-center gap-2">
                      {program.enrollment && program.isActive && (
                        <span className="text-xs font-medium text-primary hidden sm:inline">
                          {program.enrollment.progress}%
                        </span>
                      )}
                      {isThisUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Switch
                          checked={program.isActive}
                          onCheckedChange={() => 
                            onToggleEnrollment(
                              student.user_id,
                              program.id,
                              program.enrollment?.id || null,
                              program.isActive ? "active" : null
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export { StudentEnrollmentCard };
