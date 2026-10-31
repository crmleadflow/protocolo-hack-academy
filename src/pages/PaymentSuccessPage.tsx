import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [programId, setProgramId] = useState<string | null>(null);

  useEffect(() => {
    const capturePayment = async () => {
      const token = searchParams.get("token"); // PayPal order ID

      if (!token || !session) {
        setIsProcessing(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("paypal-capture-order", {
          body: { orderId: token },
        });

        if (error) throw error;

        setIsSuccess(true);
        setProgramId(data.programId);

        toast({
          title: "¡Pago completado!",
          description: "Ya tienes acceso al programa",
        });
      } catch (error) {
        console.error("Error capturing payment:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Hubo un problema procesando tu pago. Por favor contacta soporte.",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    capturePayment();
  }, [searchParams, session]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <ParticleBackground particleCount={30} />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <HolographicCard variant="gradient" className="max-w-md w-full text-center">
        {isProcessing ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-heading font-bold">Procesando tu pago...</h2>
            <p className="text-muted-foreground">Por favor espera mientras confirmamos tu compra</p>
          </div>
        ) : isSuccess ? (
          <div className="py-12 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">¡Pago Exitoso!</h2>
              <p className="text-muted-foreground mt-2">
                Tu inscripción ha sido confirmada. Ya tienes acceso completo al programa.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {programId && (
                <NeonButton onClick={() => navigate(`/course/${programId}`)}>
                  Ir al Curso
                  <ArrowRight className="w-4 h-4" />
                </NeonButton>
              )}
              <NeonButton variant="outline" onClick={() => navigate("/dashboard")}>
                Ir al Dashboard
              </NeonButton>
            </div>
          </div>
        ) : (
          <div className="py-12 space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <span className="text-4xl">❌</span>
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Error en el pago</h2>
              <p className="text-muted-foreground mt-2">
                No pudimos procesar tu pago. Por favor intenta de nuevo o contacta soporte.
              </p>
            </div>
            <NeonButton onClick={() => navigate("/catalog")}>
              Volver al catálogo
            </NeonButton>
          </div>
        )}
      </HolographicCard>
    </div>
  );
};

export default PaymentSuccessPage;
