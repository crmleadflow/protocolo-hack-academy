import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MentorProfile {
  full_name: string | null;
  avatar_url: string | null;
}

// Loads a course's mentor (name + photo) by their user id.
export function useMentorProfile(mentorId: string | null | undefined) {
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(!!mentorId);

  useEffect(() => {
    if (!mentorId) {
      setMentor(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", mentorId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Error fetching mentor profile:", error);
          setMentor(null);
        } else {
          setMentor(data ?? null);
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mentorId]);

  return { mentor, isLoading };
}
