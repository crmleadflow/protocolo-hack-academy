import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ID del programa "Protocolo Hack Completo" que otorga los bonos
const PROTOCOLO_HACK_COMPLETO_ID = "c5496a23-6acd-43f9-bb63-affd19992c3f";

// IDs de las herramientas
const MENTOR_IA_TOOL_ID = "a9132702-2ef7-4867-b661-fa7c07043e79";
const NEURO_SCANNER_TOOL_ID = "725bab19-0788-4311-8089-eab60ec0bbbf";

export interface BonusAccess {
  hasMentorAccess: boolean;
  hasNeuroScannerAccess: boolean;
  hasFullPackage: boolean;
  isLoading: boolean;
}

export function useBonusAccess(): BonusAccess {
  const { user, isAdmin } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["bonus-access", user?.id],
    queryFn: async () => {
      if (!user) return { hasFullPackage: false, hasMentorAccess: false, hasNeuroScannerAccess: false };

      // Verificar inscripción al paquete completo
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("program_id", PROTOCOLO_HACK_COMPLETO_ID)
        .eq("status", "active")
        .maybeSingle();

      if (enrollmentError) {
        console.error("Error checking enrollment:", enrollmentError);
      }

      const hasFullPackage = !!enrollment;

      // Si tiene el paquete completo, tiene acceso a ambas herramientas
      if (hasFullPackage) {
        return {
          hasFullPackage: true,
          hasMentorAccess: true,
          hasNeuroScannerAccess: true,
        };
      }

      // Verificar acceso directo a herramientas (suscripciones o por otros programas)
      const { data: mentorAccess } = await supabase
        .rpc("has_tool_access", { _user_id: user.id, _tool_id: MENTOR_IA_TOOL_ID });

      const { data: neuroAccess } = await supabase
        .rpc("has_tool_access", { _user_id: user.id, _tool_id: NEURO_SCANNER_TOOL_ID });

      return {
        hasFullPackage: false,
        hasMentorAccess: !!mentorAccess,
        hasNeuroScannerAccess: !!neuroAccess,
      };
    },
    enabled: !!user,
  });

  // Los administradores siempre tienen acceso
  if (isAdmin) {
    return {
      hasMentorAccess: true,
      hasNeuroScannerAccess: true,
      hasFullPackage: true,
      isLoading: false,
    };
  }

  return {
    hasMentorAccess: data?.hasMentorAccess ?? false,
    hasNeuroScannerAccess: data?.hasNeuroScannerAccess ?? false,
    hasFullPackage: data?.hasFullPackage ?? false,
    isLoading,
  };
}

export { PROTOCOLO_HACK_COMPLETO_ID, MENTOR_IA_TOOL_ID, NEURO_SCANNER_TOOL_ID };
