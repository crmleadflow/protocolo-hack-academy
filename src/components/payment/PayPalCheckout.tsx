import React, { useState } from "react";
import { Lock, CreditCard, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PayPalCheckoutProps {
  programId: string;
  programTitle: string;
  price: number;
  currency?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  programId,
  programTitle,
  price,
  currency = "USD",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Desbloquear Programa
          </DialogTitle>
          <DialogDescription>
            Completa tu pago para obtener acceso completo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Program Info */}
          <div className="p-4 rounded-xl bg-muted/50">
            <h3 className="font-semibold text-lg">{programTitle}</h3>
            <p className="text-muted-foreground text-sm mt-1">Acceso de por vida</p>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-heading font-bold text-gradient">
              ${price.toFixed(2)} {currency}
            </div>
            <p className="text-muted-foreground text-sm mt-1">Pago único</p>
          </div>

          {/* PayPal Button */}
          <NeonButton
            onClick={handlePayment}
            disabled={isLoading}
            size="lg"
            className="w-full"
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
          <p className="text-center text-xs text-muted-foreground">
            🔒 Pago seguro procesado por PayPal
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
