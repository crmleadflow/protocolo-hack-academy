import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NeuroScan {
  id: string;
  user_id: string;
  title: string;
  transcript: string;
  duration_seconds: number | null;
  words_per_minute: number | null;
  filler_words_count: number;
  filler_words_detected: string[];
  persuasive_keywords_count: number;
  persuasive_keywords_detected: string[];
  tone_analysis: string | null;
  strengths: string[];
  improvements: string[];
  closing_score: number;
  ai_feedback: string | null;
  created_at: string;
}

export function useNeuroScanner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch user's scan history
  const { data: scans = [], isLoading: isLoadingScans } = useQuery({
    queryKey: ["neuro-scans", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("neuro_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(scan => ({
        ...scan,
        filler_words_detected: scan.filler_words_detected as string[] || [],
        persuasive_keywords_detected: scan.persuasive_keywords_detected as string[] || [],
        strengths: scan.strengths as string[] || [],
        improvements: scan.improvements as string[] || [],
      })) as NeuroScan[];
    },
    enabled: !!user,
  });

  // Analyze transcript mutation
  const analyzeMutation = useMutation({
    mutationFn: async ({ transcript, durationSeconds, title }: { 
      transcript: string; 
      durationSeconds: number;
      title?: string;
    }) => {
      setIsAnalyzing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neuro-scanner`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ transcript, durationSeconds, title }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["neuro-scans"] });
      toast.success("¡Análisis completado!");
      setIsAnalyzing(false);
      return data.scan;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al analizar");
      setIsAnalyzing(false);
    },
  });

  // Delete scan mutation
  const deleteMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase
        .from("neuro_scans")
        .delete()
        .eq("id", scanId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neuro-scans"] });
      toast.success("Análisis eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar");
    },
  });

  // Get average score
  const averageScore = scans.length > 0
    ? Math.round(scans.reduce((sum, scan) => sum + scan.closing_score, 0) / scans.length)
    : 0;

  // Get best score
  const bestScore = scans.length > 0
    ? Math.max(...scans.map(scan => scan.closing_score))
    : 0;

  return {
    scans,
    isLoadingScans,
    isAnalyzing,
    averageScore,
    bestScore,
    analyze: analyzeMutation.mutateAsync,
    deleteScan: deleteMutation.mutate,
  };
}
