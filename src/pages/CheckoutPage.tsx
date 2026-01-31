import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Lock, 
  CreditCard, 
  Wallet, 
  Building2, 
  Smartphone,
  CheckCircle,
  BookOpen,
  Users,
  Zap,
  Shield,
  Loader2,
  AlertCircle,
  Star,
  Clock,
  Sparkles
} from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  comingSoon?: boolean;
}

interface ProgramDetails {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  thumbnail_url: string | null;
  totalModules: number;
  totalLessons: number;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

const CheckoutPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidIdError, setInvalidIdError] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "paypal",
      name: "PayPal",
      description: "Paga con tu cuenta PayPal o tarjeta de crédito/débito",
      icon: <Wallet className="w-6 h-6" />,
      available: true,
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Tarjeta de crédito/débito procesada por Stripe",
      icon: <CreditCard className="w-6 h-6" />,
      available: false,
      comingSoon: true,
    },
    {
      id: "bank_transfer",
      name: "Transferencia Bancaria",
      description: "Transferencia directa a nuestra cuenta bancaria",
      icon: <Building2 className="w-6 h-6" />,
      available: false,
      comingSoon: true,
    },
    {
      id: "mobile_payment",
      name: "Pago Móvil",
      description: "Pago móvil o billetera digital local",
      icon: <Smartphone className="w-6 h-6" />,
      available: false,
      comingSoon: true,
    },
  ];

  // Auto-redirect countdown for invalid ID
  useEffect(() => {
    if (!invalidIdError) return;
    
    if (countdown <= 0) {
      navigate("/catalog", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [invalidIdError, countdown, navigate]);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId || !isUuid(programId)) {
        setInvalidIdError(true);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch program details
        const { data: programData, error: programError } = await supabase
          .from("programs")
          .select("*")
          .eq("id", programId)
          .single();

        if (programError || !programData) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Programa no encontrado",
          });
          navigate("/catalog");
          return;
        }

        // Count modules and lessons
        const { data: modulesData } = await supabase
          .from("modules")
          .select("id")
          .eq("program_id", programId);

        const totalModules = modulesData?.length || 0;

        let totalLessons = 0;
        if (modulesData && modulesData.length > 0) {
          const moduleIds = modulesData.map(m => m.id);
          const { count } = await supabase
            .from("lessons")
            .select("*", { count: "exact", head: true })
            .in("module_id", moduleIds);
          totalLessons = count || 0;
        }

        setProgram({
          id: programData.id,
          title: programData.title,
          description: programData.description,
          price: programData.price,
          currency: programData.currency,
          thumbnail_url: programData.thumbnail_url,
          totalModules,
          totalLessons,
        });
      } catch (error) {
        console.error("Error fetching program:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el programa",
        });
        navigate("/catalog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgram();
  }, [programId, navigate, toast]);

  const handlePayment = async () => {
    if (!selectedMethod || !program) return;

    setIsProcessing(true);

    try {
      if (selectedMethod === "paypal") {
        const { data, error } = await supabase.functions.invoke("paypal-create-order", {
          body: { programId: program.id },
        });

        if (error) throw error;

        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          throw new Error("No approval URL received");
        }
      } else {
        // Placeholder for other payment methods
        toast({
          title: "Próximamente",
          description: "Este método de pago estará disponible pronto",
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar el pago. Por favor intenta de nuevo.",
      });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <ParticleBackground particleCount={20} />
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error screen for invalid program ID with auto-redirect
  if (invalidIdError) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <ParticleBackground particleCount={20} />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <HolographicCard variant="gradient" className="p-8 text-center max-w-md relative z-10">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          
          <h2 className="text-2xl font-heading font-bold mb-3">
            Redirigiendo al catálogo...
          </h2>
          
          <p className="text-muted-foreground mb-4">
            El enlace de pago no es válido. Te llevaremos al catálogo en{" "}
            <span className="font-bold text-primary">{countdown}</span> segundos.
          </p>

          <NeonButton 
            onClick={() => navigate("/catalog", { replace: true })} 
            className="w-full"
          >
            <BookOpen className="w-4 h-4" />
            Ir ahora al catálogo
          </NeonButton>

          <p className="text-xs text-muted-foreground mt-6">
            Selecciona el programa que deseas adquirir desde el catálogo.
          </p>
        </HolographicCard>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <ParticleBackground particleCount={20} />
        <HolographicCard variant="gradient" className="p-8 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">Programa no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El programa que buscas no está disponible o ha sido eliminado.
          </p>
          <NeonButton onClick={() => navigate("/catalog")} className="w-full">
            <BookOpen className="w-4 h-4" />
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
        {/* Mobile Header - Fixed */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 lg:hidden">
          <div className="container mx-auto px-4 py-3">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 lg:py-12 max-w-6xl">
          {/* Desktop Back Link */}
          <Link
            to="/catalog"
            className="hidden lg:inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>

          {/* Main Layout - Mobile First */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            
            {/* Order Summary - Shows first on mobile */}
            <div className="lg:order-2 lg:w-[380px] lg:flex-shrink-0">
              <div className="lg:sticky lg:top-8">
                {/* Program Card */}
                <HolographicCard variant="gradient" className="p-0 overflow-hidden">
                  {/* Program Image */}
                  <div className="relative aspect-[16/9] lg:aspect-[16/10] overflow-hidden">
                    {program.thumbnail_url ? (
                      <img
                        src={program.thumbnail_url}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30">
                        <BookOpen className="w-16 h-16 text-primary/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-heading font-bold text-lg shadow-lg shadow-primary/30">
                        ${program.price.toFixed(0)} {program.currency}
                      </div>
                    </div>
                  </div>

                  {/* Program Info */}
                  <div className="p-5 lg:p-6 space-y-4">
                    <div>
                      <h2 className="font-heading font-bold text-xl lg:text-2xl mb-2">
                        {program.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-primary" />
                          {program.totalLessons} lecciones
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-primary" />
                          {program.totalModules} módulos
                        </span>
                      </div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Acceso de por vida</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Actualizaciones incluidas</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Material descargable</span>
                      </div>
                    </div>
                  </div>
                </HolographicCard>

                {/* Trust Badges - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Pago seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>SSL Encriptado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:order-1 flex-1 space-y-6">
              {/* Title - Desktop only */}
              <div className="hidden lg:block">
                <h1 className="text-3xl font-heading font-bold mb-2">
                  Completar <span className="text-gradient">Compra</span>
                </h1>
                <p className="text-muted-foreground">
                  Selecciona tu método de pago preferido
                </p>
              </div>

              {/* Mobile Title */}
              <div className="lg:hidden text-center">
                <h1 className="text-2xl font-heading font-bold">
                  Método de <span className="text-gradient">Pago</span>
                </h1>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => method.available && setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className={`w-full p-4 lg:p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.2)] scale-[1.02]"
                        : method.available
                        ? "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 hover:scale-[1.01]"
                        : "border-border/30 bg-card/30 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-all ${
                          selectedMethod === method.id
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-semibold text-base lg:text-lg">
                            {method.name}
                          </span>
                          {method.comingSoon && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary font-medium">
                              Próximamente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {method.description}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}>
                        {selectedMethod === method.id && (
                          <CheckCircle className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Price Summary - Mobile */}
              <div className="lg:hidden">
                <HolographicCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${program.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-primary">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-heading font-bold text-lg">Total</span>
                    <span className="font-heading font-bold text-xl text-gradient">
                      ${program.price.toFixed(2)} {program.currency}
                    </span>
                  </div>
                </HolographicCard>
              </div>

              {/* Pay Button */}
              <NeonButton
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                size="lg"
                className="w-full h-14 lg:h-16 text-lg lg:text-xl font-bold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {selectedMethod 
                      ? `Pagar $${program.price.toFixed(2)} ${program.currency}`
                      : "Selecciona un método"
                    }
                  </>
                )}
              </NeonButton>

              {/* Security Note - Mobile */}
              <div className="flex items-center justify-center gap-4 lg:hidden text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Pago seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>SSL Encriptado</span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                Al completar la compra, aceptas nuestros{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  términos y condiciones
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
