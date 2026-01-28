import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Enrollment {
  id: string;
  program_id: string;
  status: "pending" | "active" | "expired" | "cancelled";
  enrolled_at: string | null;
  expires_at: string | null;
}

export const useEnrollment = (programId?: string) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setEnrollments([]);
        setHasActiveEnrollment(false);
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id);

        if (programId) {
          query = query.eq("program_id", programId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching enrollments:", error);
          return;
        }

        const typedData = (data || []).map((e) => ({
          ...e,
          status: e.status as Enrollment["status"],
        }));

        setEnrollments(typedData);

        // Check if user has active enrollment for the specific program
        if (programId) {
          const activeEnrollment = typedData.find(
            (e) =>
              e.status === "active" &&
              (!e.expires_at || new Date(e.expires_at) > new Date())
          );
          setHasActiveEnrollment(!!activeEnrollment);
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, programId]);

  return { enrollments, isLoading, hasActiveEnrollment };
};
