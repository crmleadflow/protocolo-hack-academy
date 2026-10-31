import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { HolographicCard } from "@/components/ui/holographic-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <ParticleBackground particleCount={30} />
      
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-block">
            <img src={logo} alt="Protocolo Hack" className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-heading font-bold">
            {emailSent ? "Revisa tu correo" : "Recuperar contraseña"}
          </h1>
        </div>

        <HolographicCard variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Hemos enviado un enlace de recuperación a <span className="text-foreground font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <Link to="/login">
                <NeonButton variant="outline" className="w-full mt-4">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </NeonButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-muted-foreground text-sm text-center">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <GlassInput
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <NeonButton type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </NeonButton>
            </form>
          )}
        </HolographicCard>

        {/* Back to login link */}
        {!emailSent && (
          <p className="text-center mt-6 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
