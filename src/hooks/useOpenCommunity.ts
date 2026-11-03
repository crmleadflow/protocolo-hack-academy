import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// La comunidad abierta no está publicada en el catálogo: solo la ven quienes están inscritos.
export function useOpenCommunity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: program, isLoading } = useQuery({
    queryKey: ["open-community", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("is_open_community", true)
        .maybeSingle();
      return data;
    },
  });

  const join = async () => {
    const { error } = await supabase.rpc("join_open_community");
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ["open-community"] });
    await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
  };

  return { program: program ?? null, isLoading, join };
}
