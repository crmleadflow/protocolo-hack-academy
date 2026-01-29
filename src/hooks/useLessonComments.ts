import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface LessonComment {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useLessonComments(lessonId: string | undefined) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!lessonId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    try {
      // First fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("lesson_comments")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Create a map of user_id to profile
      const profilesMap = new Map(
        profilesData?.map((p) => [p.user_id, p]) || []
      );

      // Combine comments with profiles
      const commentsWithProfiles: LessonComment[] = commentsData.map((comment) => ({
        ...comment,
        profile: profilesMap.get(comment.user_id) || null,
      }));

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error("Error fetching lesson comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  const addComment = async (content: string) => {
    if (!lessonId || !user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("lesson_comments").insert({
        lesson_id: lessonId,
        user_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;

      toast({ title: "Comentario agregado" });
      await fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("lesson_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast({ title: "Comentario eliminado" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive",
      });
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!lessonId) return;

    const channel = supabase
      .channel(`lesson-comments-${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson_comments",
          filter: `lesson_id=eq.${lessonId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId, fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    isSubmitting,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}
