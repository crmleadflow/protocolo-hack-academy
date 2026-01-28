import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { HolographicCard } from "@/components/ui/holographic-card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAdmin } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "¡Bienvenido!",
      description: "Has iniciado sesión correctamente",
    });

    // Redirect based on role (check after login state settles)
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 100);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <ParticleBackground particleCount={30} />
      
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-block">
            <img src={logo} alt="Protocolo Hack" className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-heading font-bold">
            Bienvenido de vuelta
          </h1>
          <p className="text-muted-foreground mt-2">
            Accede a tu central de inteligencia
          </p>
        </div>

        {/* Login Card */}
        <HolographicCard variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Contraseña</label>
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

            {/* Forgot password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit */}
            <NeonButton type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Accediendo...
                </div>
              ) : (
                <>
                  Acceder
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </NeonButton>
          </form>
        </HolographicCard>

        {/* Register link */}
        <p className="text-center mt-6 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
