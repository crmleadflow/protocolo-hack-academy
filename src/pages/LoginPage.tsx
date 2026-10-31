import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setLoading(false);
    if (error) return toast.error("No pudimos enviar el enlace", { description: error.message });
    setSent(true);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) return toast.error("Correo o contraseña incorrectos");
    toast.success("¡Bienvenido!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-5">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-heading text-xl font-bold">
          PROTOCOLO<span className="text-primary">HACK</span>
        </Link>
        <h1 className="mt-10 text-center text-4xl font-bold">
          Entra a tu <span className="serif-accent text-primary">cuenta</span>
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          {mode === "magic" ? "Sin contraseñas: te enviamos un enlace a tu correo." : "Acceso con contraseña."}
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
          {sent ? (
            <div className="text-center">
              <MailCheck className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-4 font-heading text-lg font-semibold">Revisa tu correo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enviamos un enlace de acceso a <span className="text-foreground">{email}</span>. Ábrelo en este dispositivo.
              </p>
              <button onClick={() => setSent(false)} className="mt-6 text-sm text-primary hover:underline">
                Usar otro correo
              </button>
            </div>
          ) : (
            <form onSubmit={mode === "magic" ? handleMagic : handlePassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" required placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10 rounded-xl" />
              </div>
              {mode === "password" && (
                <Input type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
              )}
              <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "magic" ? "Enviarme el enlace" : "Entrar"} <ArrowRight className="ml-1 h-4 w-4" /></>}
              </Button>
              {mode === "password" && (
                <Link to="/forgot-password" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </form>
          )}
        </div>

        {!sent && (
          <button
            onClick={() => setMode(mode === "magic" ? "password" : "magic")}
            className="mt-6 block w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "magic" ? "Prefiero entrar con contraseña" : "Entrar con enlace mágico"}
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
