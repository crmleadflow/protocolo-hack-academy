import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface LessonRating {
  id: string;
  lesson_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
}

export function useLessonRatings(lessonId: string | undefined) {
  const [summary, setSummary] = useState<RatingSummary>({
    averageRating: 0,
    totalRatings: 0,
    userRating: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRatings = useCallback(async () => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all ratings for this lesson
      const { data: ratings, error } = await supabase
        .from("lesson_ratings")
        .select("*")
        .eq("lesson_id", lessonId);

      if (error) throw error;

      if (!ratings || ratings.length === 0) {
        setSummary({
          averageRating: 0,
          totalRatings: 0,
          userRating: null,
        });
      } else {
        const totalRatings = ratings.length;
        const averageRating =
          ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
        const userRating = user
          ? ratings.find((r) => r.user_id === user.id)?.rating || null
          : null;

        setSummary({
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings,
          userRating,
        });
      }
    } catch (error) {
      console.error("Error fetching lesson ratings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, user]);

  const rateLesson = async (rating: number) => {
    if (!lessonId || !user || rating < 1 || rating > 5) return;

    setIsSubmitting(true);
    try {
      // Check if user already rated
      const { data: existing } = await supabase
        .from("lesson_ratings")
        .select("id")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing rating
        const { error } = await supabase
          .from("lesson_ratings")
          .update({ rating })
          .eq("id", existing.id);

        if (error) throw error;
        toast({ title: "Calificación actualizada" });
      } else {
        // Insert new rating
        const { error } = await supabase.from("lesson_ratings").insert({
          lesson_id: lessonId,
          user_id: user.id,
          rating,
        });

        if (error) throw error;
        toast({ title: "¡Gracias por tu calificación!" });
      }

      await fetchRatings();
    } catch (error) {
      console.error("Error rating lesson:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return {
    summary,
    isLoading,
    isSubmitting,
    rateLesson,
    refetch: fetchRatings,
  };
}
