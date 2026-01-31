import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";

const CryptoPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const address = searchParams.get("address") || "";
  const amount = searchParams.get("amount") || "";
  const currency = searchParams.get("currency") || "USDTTRC20";
  const programId = searchParams.get("programId") || "";
  const paymentId = searchParams.get("paymentId") || "";

  const [copied, setCopied] = useState<"address" | "amount" | null>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = async (text: string, type: "address" | "amount") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copiado",
        description: type === "address" ? "Dirección copiada" : "Monto copiado",
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar al portapapeles",
      });
    }
  };

  if (!address || !amount) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <ParticleBackground particleCount={20} />
        <HolographicCard variant="gradient" className="p-8 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">
            Información de pago inválida
          </h2>
          <p className="text-muted-foreground mb-6">
            No se encontró la información necesaria para el pago.
          </p>
          <NeonButton onClick={() => navigate("/catalog")} className="w-full">
            Volver al catálogo
          </NeonButton>
        </HolographicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      <ParticleBackground particleCount={25} />

      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

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

        <div className="container mx-auto px-4 py-8 max-w-lg">
          {/* Timer Card */}
          <HolographicCard className="p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              <span className="font-heading font-bold text-lg">
                {timeLeft > 0 ? formatTime(timeLeft) : "Expirado"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tiempo restante para completar el pago
            </p>
          </HolographicCard>

          {/* Main Payment Card */}
          <HolographicCard variant="gradient" className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6C6.264 21.6 1.6 16.936 1.6 12S6.264 2.4 12 2.4 22.4 7.064 22.4 12 17.736 21.6 12 21.6zm3.408-15.6H8.592L7.2 9.6l4.8 8.4 4.8-8.4-1.392-3.6zm-3.408 9L9.6 10.8l2.4-1.2 2.4 1.2L12 15z" />
                </svg>
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">
                Pago con <span className="text-gradient">USDT (TRON)</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Envía el monto exacto a la dirección indicada
              </p>
            </div>

            {/* Amount Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Monto a enviar
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-4 rounded-xl bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-2xl text-gradient">
                      {amount}
                    </span>
                    <span className="text-sm text-muted-foreground uppercase">
                      {currency}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(amount, "amount")}
                  className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
                >
                  {copied === "amount" ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Copy className="w-5 h-5 text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Dirección TRON (TRC20)
              </label>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">
                    {address}
                  </code>
                  <button
                    onClick={() => handleCopy(address, "address")}
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors flex-shrink-0"
                  >
                    {copied === "address" ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-primary" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Instrucciones
              </h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Copia la dirección de TRON exactamente</li>
                <li>Envía <strong className="text-foreground">{amount} USDT</strong> (TRC20)</li>
                <li>Espera la confirmación de la red (1-5 min)</li>
                <li>Serás redirigido automáticamente al completarse</li>
              </ol>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Asegúrate de enviar <strong>USDT en la red TRON (TRC20)</strong>. 
                  Enviar otro token o usar otra red resultará en pérdida de fondos.
                </span>
              </p>
            </div>

            {/* Status Check */}
            <NeonButton
              onClick={() => navigate(`/payment-success?programId=${programId}&method=crypto`)}
              variant="secondary"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4" />
              Ya realicé el pago
            </NeonButton>
          </HolographicCard>

          {/* Payment ID */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            ID de pago: {paymentId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentPage;
