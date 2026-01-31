import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Try to get programId from URL if available
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <ParticleBackground particleCount={30} />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <HolographicCard variant="gradient" className="max-w-md w-full text-center">
        <div className="py-12 space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          
          <div>
            <h2 className="text-2xl font-heading font-bold">Pago Cancelado</h2>
            <p className="text-muted-foreground mt-2">
              Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <NeonButton onClick={() => navigate("/catalog")}>
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </NeonButton>
            <NeonButton variant="outline" onClick={() => navigate(-1)}>
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </NeonButton>
          </div>
        </div>
      </HolographicCard>
    </div>
  );
};

export default PaymentCancelPage;
