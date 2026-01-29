import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  fullName: string;
  avatarUrl: string | null;
}

// Simple event emitter for profile updates
const listeners = new Set<() => void>();

export const notifyProfileUpdate = () => {
  listeners.forEach((listener) => listener());
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    avatarUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile({ fullName: "", avatarUrl: null });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile({
        fullName: data?.full_name || user.user_metadata?.full_name || "",
        avatarUrl: data?.avatar_url || null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to user metadata
      setProfile({
        fullName: user.user_metadata?.full_name || "",
        avatarUrl: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Listen for profile updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchProfile();
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, [fetchProfile]);

  const initials = profile.fullName
    ? profile.fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const displayName = profile.fullName || user?.email?.split("@")[0] || "Usuario";

  return {
    profile,
    isLoading,
    initials,
    displayName,
    refetch: fetchProfile,
  };
}
