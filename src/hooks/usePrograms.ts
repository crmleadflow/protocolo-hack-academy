import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Program = Tables<"programs">;
export type Module = Tables<"modules">;
export type Lesson = Tables<"lessons">;

export interface ProgramWithModules extends Program {
  modules: (Module & { lessons: Lesson[] })[];
}

export function usePrograms() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
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
  }, [toast]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const createProgram = async (program: TablesInsert<"programs">) => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .insert(program)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Programa creado",
        description: "El programa se ha creado correctamente",
      });

      await fetchPrograms();
      return data;
    } catch (error) {
      console.error("Error creating program:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el programa",
      });
      return null;
    }
  };

  const updateProgram = async (id: string, updates: TablesUpdate<"programs">) => {
    try {
      const { error } = await supabase
        .from("programs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Programa actualizado",
        description: "Los cambios se han guardado",
      });

      await fetchPrograms();
      return true;
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el programa",
      });
      return false;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Programa eliminado",
        description: "El programa se ha eliminado correctamente",
      });

      await fetchPrograms();
      return true;
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el programa",
      });
      return false;
    }
  };

  const updateProgramOrder = async (orderedIds: string[]) => {
    try {
      // Update each program's sort_order based on its position in the array
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("programs")
          .update({ sort_order: index + 1 })
          .eq("id", id)
      );
      
      await Promise.all(updates);
      
      // Optimistically update local state
      setPrograms(prev => {
        const reordered = orderedIds
          .map(id => prev.find(p => p.id === id))
          .filter((p): p is Program => p !== undefined);
        return reordered;
      });
      
      return true;
    } catch (error) {
      console.error("Error updating program order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el orden de los programas",
      });
      return false;
    }
  };

  return {
    programs,
    isLoading,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    updateProgramOrder,
  };
}

export function useProgramDetail(programId: string | undefined) {
  const { toast } = useToast();
  const [program, setProgram] = useState<ProgramWithModules | null>(null);
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
        .single();

      if (programError) throw programError;

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("program_id", programId)
        .order("sort_order", { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        (modulesData || []).map(async (module) => {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from("lessons")
            .select("*")
            .eq("module_id", module.id)
            .order("sort_order", { ascending: true });

          if (lessonsError) throw lessonsError;

          return {
            ...module,
            lessons: lessonsData || [],
          };
        })
      );

      setProgram({
        ...programData,
        modules: modulesWithLessons,
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
  }, [programId, toast]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  // Module operations
  const createModule = async (module: TablesInsert<"modules">) => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .insert(module)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Módulo creado",
        description: "El módulo se ha creado correctamente",
      });

      await fetchProgram();
      return data;
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el módulo",
      });
      return null;
    }
  };

  const updateModule = async (id: string, updates: TablesUpdate<"modules">) => {
    try {
      const { error } = await supabase
        .from("modules")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error updating module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el módulo",
      });
      return false;
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Módulo eliminado",
        description: "El módulo se ha eliminado",
      });

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el módulo",
      });
      return false;
    }
  };

  // Lesson operations
  const createLesson = async (lesson: TablesInsert<"lessons">) => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .insert(lesson)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lección creada",
        description: "La lección se ha creado correctamente",
      });

      await fetchProgram();
      return data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la lección",
      });
      return null;
    }
  };

  const updateLesson = async (id: string, updates: TablesUpdate<"lessons">) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la lección",
      });
      return false;
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Lección eliminada",
        description: "La lección se ha eliminado",
      });

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la lección",
      });
      return false;
    }
  };

  return {
    program,
    isLoading,
    fetchProgram,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
  };
}
