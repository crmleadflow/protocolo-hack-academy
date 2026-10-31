import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LessonResource {
  id: string;
  lesson_id: string;
  type: "file" | "link";
  title: string;
  url: string;
  file_name: string | null;
  file_size: number | null;
  sort_order: number;
}

export function useLessonResources(lessonId: string | undefined) {
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    if (!lessonId) {
      setResources([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lesson_resources")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setResources(
        (data || []).map((r) => ({
          ...r,
          type: r.type as "file" | "link",
        }))
      );
    } catch (error) {
      console.error("Error fetching lesson resources:", error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return {
    resources,
    isLoading,
    refetch: fetchResources,
  };
}
