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
  AlertCircle
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

const CheckoutPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) {
        navigate("/catalog");
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

  if (!program) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <ParticleBackground particleCount={20} />
        <HolographicCard className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold mb-2">Programa no encontrado</h2>
          <p className="text-muted-foreground mb-4">
            El programa que buscas no está disponible.
          </p>
          <NeonButton onClick={() => navigate("/catalog")}>
            Volver al catálogo
          </NeonButton>
        </HolographicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground particleCount={30} />

      {/* Background decorative elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            Completar <span className="text-gradient">Compra</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Methods - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            <HolographicCard variant="gradient" className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Selecciona tu método de pago
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => method.available && setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                        : method.available
                        ? "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80"
                        : "border-border/30 bg-card/30 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedMethod === method.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold">{method.name}</span>
                          {method.comingSoon && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary">
                              Próximamente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </HolographicCard>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Tus datos están protegidos con encriptación de nivel bancario</span>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-2 space-y-6">
            <HolographicCard variant="gradient" className="p-6 sticky top-8">
              <h2 className="text-lg font-heading font-semibold mb-4">Resumen del pedido</h2>

              {/* Program Preview */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {program.thumbnail_url ? (
                    <img
                      src={program.thumbnail_url}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold truncate">{program.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {program.totalLessons} lecciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {program.totalModules} módulos
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6 pb-6 border-b border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground">Incluye:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span>Acceso de por vida</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-primary" />
                    </div>
                    <span>Actualizaciones futuras</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3 h-3 text-primary" />
                    </div>
                    <span>Material descargable</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${program.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-primary">$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-heading font-bold pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span className="text-gradient">${program.price.toFixed(2)} {program.currency}</span>
                </div>
              </div>

              {/* Pay Button */}
              <NeonButton
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                size="lg"
                className="w-full h-14 text-lg"
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
                      ? `Pagar $${program.price.toFixed(2)}`
                      : "Selecciona un método de pago"
                    }
                  </>
                )}
              </NeonButton>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Al completar la compra, aceptas nuestros términos y condiciones
              </p>
            </HolographicCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
