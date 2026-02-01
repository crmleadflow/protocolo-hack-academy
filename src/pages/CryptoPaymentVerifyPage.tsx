import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollment } from "@/hooks/useEnrollment";

const CryptoPaymentVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const programId = searchParams.get("programId") || "";
  const { hasActiveEnrollment, isLoading } = useEnrollment(programId);
  
  const [checkCount, setCheckCount] = useState(0);
  const [isManualChecking, setIsManualChecking] = useState(false);

  // Auto-check every 10 seconds (up to 30 checks = 5 minutes)
  useEffect(() => {
    if (hasActiveEnrollment || checkCount >= 30) return;

    const interval = setInterval(() => {
      setCheckCount((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [hasActiveEnrollment, checkCount]);

  const handleManualCheck = () => {
    setIsManualChecking(true);
    setCheckCount((prev) => prev + 1);
    setTimeout(() => setIsManualChecking(false), 2000);
  };

  if (!programId) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <ParticleBackground particleCount={20} />
        <HolographicCard variant="gradient" className="p-8 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">
            Información inválida
          </h2>
          <p className="text-muted-foreground mb-6">
            No se encontró la información del programa.
          </p>
          <NeonButton onClick={() => navigate("/catalog")} className="w-full">
            Volver al catálogo
          </NeonButton>
        </HolographicCard>
      </div>
    );
  }

  // Payment confirmed - enrollment active
  if (hasActiveEnrollment) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <ParticleBackground particleCount={30} />

        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <HolographicCard variant="gradient" className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">
            ¡Pago Confirmado!
          </h2>
          <p className="text-muted-foreground mb-6">
            Tu pago ha sido verificado. Ya tienes acceso completo al programa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <NeonButton onClick={() => navigate(`/course/${programId}`)}>
              Ir al Curso
              <ArrowRight className="w-4 h-4" />
            </NeonButton>
            <NeonButton variant="outline" onClick={() => navigate("/dashboard")}>
              Ir al Dashboard
            </NeonButton>
          </div>
        </HolographicCard>
      </div>
    );
  }

  // Waiting for payment confirmation
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      <ParticleBackground particleCount={25} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-md">
          <HolographicCard variant="gradient" className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              {isLoading || isManualChecking ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <Clock className="w-10 h-10 text-primary" />
              )}
            </div>

            <h2 className="text-2xl font-heading font-bold mb-2">
              Verificando pago...
            </h2>
            <p className="text-muted-foreground mb-6">
              Estamos esperando la confirmación de tu pago en la red TRON. 
              Esto puede tomar entre 1-5 minutos dependiendo de la congestión de la red.
            </p>

            {/* Progress indicator */}
            <div className="p-4 rounded-xl bg-background/50 border border-border/50 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificaciones automáticas: {checkCount}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-left mb-6">
              <h3 className="font-heading font-semibold mb-2">¿Qué está pasando?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Tu transacción está siendo procesada en la blockchain
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Cuando se confirme, tu acceso se activará automáticamente
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  No cierres esta página, se actualizará automáticamente
                </li>
              </ul>
            </div>

            <NeonButton
              onClick={handleManualCheck}
              variant="secondary"
              className="w-full"
              disabled={isManualChecking}
            >
              {isManualChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Verificar ahora
            </NeonButton>

            {checkCount >= 30 && (
              <p className="text-xs text-muted-foreground mt-4">
                Si tu pago no se confirma en 30 minutos, contacta a soporte con tu ID de transacción.
              </p>
            )}
          </HolographicCard>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentVerifyPage;
