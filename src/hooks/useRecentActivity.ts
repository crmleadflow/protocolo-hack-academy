import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RecentActivity {
  id: string;
  type: "enrollment" | "completion" | "payment" | "comment";
  message: string;
  time: string;
  created_at: string;
  user_name?: string;
  program_title?: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  return date.toLocaleDateString("es-ES");
}

export function useRecentActivity(limit = 10) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      // Fetch recent enrollments with user profiles and programs
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          created_at,
          user_id,
          program_id,
          programs:program_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError);
      }

      // Fetch recent lesson completions
      const { data: completions, error: completionsError } = await supabase
        .from("lesson_progress")
        .select(`
          id,
          completed_at,
          user_id,
          lesson_id,
          lessons:lesson_id (
            title,
            modules:module_id (
              programs:program_id (title)
            )
          )
        `)
        .eq("completed", true)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(limit);

      if (completionsError) {
        console.error("Error fetching completions:", completionsError);
      }

      // Fetch recent payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          id,
          created_at,
          user_id,
          amount,
          programs:program_id (title)
        `)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
      }

      // Get user profiles for all user_ids
      const allUserIds = new Set<string>();
      enrollments?.forEach((e) => allUserIds.add(e.user_id));
      completions?.forEach((c) => allUserIds.add(c.user_id));
      payments?.forEach((p) => allUserIds.add(p.user_id));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", Array.from(allUserIds));

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p.full_name || "Usuario"]) || []
      );

      // Combine and sort activities
      const allActivities: RecentActivity[] = [];

      // Add enrollments
      enrollments?.forEach((e) => {
        const programTitle = (e.programs as any)?.title || "un programa";
        const userName = profileMap.get(e.user_id) || "Usuario";
        allActivities.push({
          id: `enrollment-${e.id}`,
          type: "enrollment",
          message: `${userName} se inscribió en ${programTitle}`,
          time: formatTimeAgo(e.created_at),
          created_at: e.created_at,
          user_name: userName,
          program_title: programTitle,
        });
      });

      // Add completions
      completions?.forEach((c) => {
        if (!c.completed_at) return;
        const lesson = c.lessons as any;
        const lessonTitle = lesson?.title || "una lección";
        const userName = profileMap.get(c.user_id) || "Usuario";
        allActivities.push({
          id: `completion-${c.id}`,
          type: "completion",
          message: `${userName} completó "${lessonTitle}"`,
          time: formatTimeAgo(c.completed_at),
          created_at: c.completed_at,
          user_name: userName,
        });
      });

      // Add payments
      payments?.forEach((p) => {
        const programTitle = (p.programs as any)?.title || "un programa";
        const userName = profileMap.get(p.user_id) || "Usuario";
        allActivities.push({
          id: `payment-${p.id}`,
          type: "payment",
          message: `${userName} compró ${programTitle} ($${p.amount})`,
          time: formatTimeAgo(p.created_at),
          created_at: p.created_at,
          user_name: userName,
          program_title: programTitle,
        });
      });

      // Sort by date and limit
      allActivities.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(allActivities.slice(0, limit));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime updates for enrollments
    const enrollmentChannel = supabase
      .channel("enrollments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "enrollments",
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    // Subscribe to realtime updates for lesson progress
    const progressChannel = supabase
      .channel("progress-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson_progress",
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    // Subscribe to realtime updates for payments
    const paymentsChannel = supabase
      .channel("payments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(enrollmentChannel);
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    refetch: fetchActivities,
  };
}
