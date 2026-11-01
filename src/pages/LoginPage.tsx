import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Teléfono inválido"),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (!user) return;
    setChecking(true);
    supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setChecking(false);
        if (data?.full_name && data?.phone) return navigate(from, { replace: true });
        setForm({
          full_name: data?.full_name || (user.user_metadata?.full_name as string) || "",
          email: data?.email || user.email || "",
          phone: data?.phone || "",
        });
        setNeedsProfile(true);
      });
  }, [user, from, navigate]);

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      setLoading(false);
      toast.error("No pudimos entrar con Google");
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setLoading(true);
    const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", user!.id).maybeSingle();
    const { error } = existing
      ? await supabase.from("profiles").update(parsed.data).eq("user_id", user!.id)
      : await supabase.from("profiles").insert({ user_id: user!.id, ...parsed.data });
    setLoading(false);
    if (error) return toast.error("No pudimos guardar tus datos", { description: error.message });
    toast.success("¡Bienvenido!");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-5">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-heading text-xl font-bold">
          PROTOCOLO<span className="text-primary">HACK</span>
        </Link>
        <h1 className="mt-10 text-center text-4xl font-bold">
          {needsProfile ? <>Completa tus <span className="serif-accent text-primary">datos</span></> : <>Entra a tu <span className="serif-accent text-primary">cuenta</span></>}
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          {needsProfile ? "Solo una vez: nombre completo, correo y teléfono." : "Entra en un clic con tu cuenta de Google."}
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
          {checking ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : needsProfile ? (
            <form onSubmit={save} className="space-y-4">
              <Input required placeholder="Nombre completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-12 rounded-xl" />
              <Input type="email" required placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl" />
              <Input type="tel" required placeholder="Teléfono (ej. +57 300 000 0000)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-xl" />
              <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continuar <ArrowRight className="ml-1 h-4 w-4" /></>}
              </Button>
            </form>
          ) : (
            <Button onClick={google} size="lg" variant="outline" className="w-full rounded-full h-12" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"/></svg>
                Continuar con Google</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
