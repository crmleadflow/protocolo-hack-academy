import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type LessonProgress = Tables<"lesson_progress">;

export interface LessonWithProgress extends Tables<"lessons"> {
  completed: boolean;
  last_position_seconds: number | null;
}

export interface ModuleWithProgress extends Tables<"modules"> {
  lessons: LessonWithProgress[];
}

export interface ProgramWithProgress extends Tables<"programs"> {
  modules: ModuleWithProgress[];
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

export function useStudentPrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<ProgramWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch published programs
      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (programsError) throw programsError;

      // Fetch user's enrollments if logged in
      let enrollments: { program_id: string; status: string }[] = [];
      if (user) {
        const { data: enrollData } = await supabase
          .from("enrollments")
          .select("program_id, status")
          .eq("user_id", user.id);
        enrollments = enrollData || [];
      }

      // Fetch all modules and lessons for these programs
      const programIds = (programsData || []).map((p) => p.id);
      
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .in("program_id", programIds)
        .order("sort_order", { ascending: true });

      if (modulesError) throw modulesError;

      const moduleIds = (modulesData || []).map((m) => m.id);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("sort_order", { ascending: true });

      if (lessonsError) throw lessonsError;

      // Fetch user's progress if logged in
      let progressData: LessonProgress[] = [];
      if (user) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id);
        progressData = progress || [];
      }

      // Combine everything
      const programsWithProgress: ProgramWithProgress[] = (programsData || []).map(
        (program) => {
          const programModules = (modulesData || []).filter(
            (m) => m.program_id === program.id
          );

          const modulesWithProgress: ModuleWithProgress[] = programModules.map(
            (module) => {
              const moduleLessons = (lessonsData || []).filter(
                (l) => l.module_id === module.id
              );

              const lessonsWithProgress: LessonWithProgress[] = moduleLessons.map(
                (lesson) => {
                  const progress = progressData.find(
                    (p) => p.lesson_id === lesson.id
                  );
                  return {
                    ...lesson,
                    completed: progress?.completed || false,
                    last_position_seconds: progress?.last_position_seconds || null,
                  };
                }
              );

              return {
                ...module,
                lessons: lessonsWithProgress,
              };
            }
          );

          const totalLessons = modulesWithProgress.reduce(
            (acc, m) => acc + m.lessons.length,
            0
          );
          const completedLessons = modulesWithProgress.reduce(
            (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
            0
          );
          const progress =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

          return {
            ...program,
            modules: modulesWithProgress,
            totalLessons,
            completedLessons,
            progress,
          };
        }
      );

      setPrograms(programsWithProgress);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los programas",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    isLoading,
    refetch: fetchPrograms,
  };
}

export function useStudentProgramDetail(programId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [program, setProgram] = useState<ProgramWithProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgram = useCallback(async () => {
    if (!programId) return;

    setIsLoading(true);
    try {
      // Fetch program
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .maybeSingle();

      if (programError) throw programError;
      if (!programData) {
        setProgram(null);
        return;
      }

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("program_id", programId)
        .order("sort_order", { ascending: true });

      if (modulesError) throw modulesError;

      const moduleIds = (modulesData || []).map((m) => m.id);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds.length > 0 ? moduleIds : ["empty"])
        .order("sort_order", { ascending: true });

      if (lessonsError) throw lessonsError;

      // Fetch user's progress if logged in
      let progressData: LessonProgress[] = [];
      if (user) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id);
        progressData = progress || [];
      }

      // Combine modules with lessons and progress
      const modulesWithProgress: ModuleWithProgress[] = (modulesData || []).map(
        (module) => {
          const moduleLessons = (lessonsData || []).filter(
            (l) => l.module_id === module.id
          );

          const lessonsWithProgress: LessonWithProgress[] = moduleLessons.map(
            (lesson) => {
              const progress = progressData.find(
                (p) => p.lesson_id === lesson.id
              );
              return {
                ...lesson,
                completed: progress?.completed || false,
                last_position_seconds: progress?.last_position_seconds || null,
              };
            }
          );

          return {
            ...module,
            lessons: lessonsWithProgress,
          };
        }
      );

      const totalLessons = modulesWithProgress.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );
      const completedLessons = modulesWithProgress.reduce(
        (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
        0
      );
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      setProgram({
        ...programData,
        modules: modulesWithProgress,
        totalLessons,
        completedLessons,
        progress,
      });
    } catch (error) {
      console.error("Error fetching program:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el programa",
      });
    } finally {
      setIsLoading(false);
    }
  }, [programId, user, toast]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  // Mark lesson as completed
  const markLessonCompleted = async (lessonId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

      if (error) throw error;

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error marking lesson completed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el progreso",
      });
      return false;
    }
  };

  // Update video position
  const updateVideoPosition = async (lessonId: string, positionSeconds: number) => {
    if (!user) return;

    try {
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          last_position_seconds: Math.floor(positionSeconds),
        },
        { onConflict: "user_id,lesson_id" }
      );
    } catch (error) {
      console.error("Error updating video position:", error);
    }
  };

  return {
    program,
    isLoading,
    refetch: fetchProgram,
    markLessonCompleted,
    updateVideoPosition,
  };
}
