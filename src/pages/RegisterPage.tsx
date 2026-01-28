import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { HolographicCard } from "@/components/ui/holographic-card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const benefits = [
  "Acceso a 7+ programas de élite",
  "Comunidad exclusiva de emprendedores",
  "Actualizaciones semanales de contenido",
  "Soporte prioritario"
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.name);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al crear cuenta",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "¡Cuenta creada!",
      description: "Bienvenido a Protocolo Hack",
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-12">
      <ParticleBackground particleCount={30} />
      
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Benefits */}
        <div className="hidden lg:block animate-fade-in">
          <Link to="/" className="inline-block mb-8">
            <img src={logo} alt="Protocolo Hack" className="h-12" />
          </Link>
          <h1 className="text-4xl font-heading font-bold mb-4">
            Únete a la <span className="text-gradient">Hermandad Hack</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Accede al ecosistema de alto rendimiento donde transformamos conocimiento en resultados.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Protocolo Hack" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-heading font-bold">
              Crea tu cuenta
            </h1>
          </div>

          <HolographicCard variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <GlassInput
                    type="text"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <GlassInput
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-border bg-input"
                  required
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Acepto los{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Términos de Servicio
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <NeonButton type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creando cuenta...
                  </div>
                ) : (
                  <>
                    Crear cuenta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </NeonButton>
            </form>
          </HolographicCard>

          {/* Login link */}
          <p className="text-center mt-6 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
