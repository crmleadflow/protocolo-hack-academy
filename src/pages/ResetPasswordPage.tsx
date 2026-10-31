import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { HolographicCard } from "@/components/ui/holographic-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user came from a password reset link
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
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

    setIsSuccess(true);
    setIsLoading(false);

    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };

  if (!isValidSession && !isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <ParticleBackground particleCount={30} />
        
        <div className="relative z-10 w-full max-w-md text-center">
          <Link to="/" className="inline-block mb-8">
            <img src={logo} alt="Protocolo Hack" className="h-16 mx-auto" />
          </Link>
          <HolographicCard variant="gradient">
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold">Enlace inválido o expirado</h2>
              <p className="text-muted-foreground">
                El enlace de recuperación de contraseña no es válido o ha expirado.
              </p>
              <Link to="/forgot-password">
                <NeonButton className="w-full mt-4">
                  Solicitar nuevo enlace
                </NeonButton>
              </Link>
            </div>
          </HolographicCard>
        </div>
      </div>
    );
  }

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
            {isSuccess ? "¡Contraseña actualizada!" : "Nueva contraseña"}
          </h1>
        </div>

        <HolographicCard variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Tu contraseña ha sido actualizada correctamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido al dashboard en unos segundos...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-muted-foreground text-sm text-center">
                Ingresa tu nueva contraseña.
              </p>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <GlassInput
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <GlassInput
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Actualizando...
                  </div>
                ) : (
                  "Actualizar contraseña"
                )}
              </NeonButton>
            </form>
          )}
        </HolographicCard>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
