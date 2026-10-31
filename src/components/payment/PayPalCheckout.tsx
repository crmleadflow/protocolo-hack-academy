import React, { useState } from "react";
import { Lock, CreditCard, Loader2, BookOpen, Users, CheckCircle, Shield, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import { HolographicCard } from "@/components/ui/holographic-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PayPalCheckoutProps {
  programId: string;
  programTitle: string;
  programThumbnail?: string | null;
  price: number;
  currency?: string;
  totalLessons?: number;
  totalModules?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  programId,
  programTitle,
  programThumbnail,
  price,
  currency = "USD",
  totalLessons = 0,
  totalModules = 0,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paypal-create-order", {
        body: { programId },
      });

      if (error) throw error;

      if (data.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el pago. Por favor intenta de nuevo.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-secondary/10 to-background p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-5 h-5 text-primary" />
              Desbloquear Programa
            </DialogTitle>
            <DialogDescription>
              Obtén acceso completo a todo el contenido
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Program Card */}
          <HolographicCard variant="gradient" className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {programThumbnail ? (
                  <img
                    src={programThumbnail}
                    alt={programTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-lg truncate">{programTitle}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {totalLessons > 0 && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {totalLessons} lecciones
                    </span>
                  )}
                  {totalModules > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {totalModules} módulos
                    </span>
                  )}
                </div>
              </div>
            </div>
          </HolographicCard>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Incluye:</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span>Acceso de por vida a todo el contenido</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span>Actualizaciones futuras incluidas</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <span>Material descargable y recursos adicionales</span>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20">
            <div className="absolute -top-3 left-4">
              <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                Pago único
              </span>
            </div>
            <div className="text-center pt-2">
              <div className="text-5xl font-heading font-bold text-gradient">
                ${price.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{currency}</p>
            </div>
          </div>

          {/* PayPal Button */}
          <NeonButton
            onClick={handlePayment}
            disabled={isLoading}
            size="lg"
            className="w-full h-14 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar con PayPal
              </>
            )}
          </NeonButton>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Pago seguro procesado por PayPal</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
