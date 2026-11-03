import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MentorOption {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Lists users with the "mentor" role, for the course mentor selector.
export function useMentors() {
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMentors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "mentor");

      if (rolesError) throw rolesError;

      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) {
        setMentors([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", ids);

      if (profilesError) throw profilesError;
      setMentors(profiles ?? []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return { mentors, isLoading, refetch: fetchMentors };
}
