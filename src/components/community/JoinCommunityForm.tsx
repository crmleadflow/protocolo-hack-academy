import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePendingJoin } from "@/lib/joinCommunity";

const joinSchema = z.object({
  full_name: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Teléfono inválido"),
});

// Formulario único para unirse a la comunidad: guarda el lead y sigue directo con Google.
export const JoinCommunityForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = joinSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    // "contacto" en vez de "comunidad": el enum del edge function desplegado aún no tiene "comunidad".
    const { error } = await supabase.functions.invoke("submit-request", {
      body: {
        request_type: "contacto",
        name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: "Quiere unirse a la comunidad",
        page_url: window.location.href.split("#")[0],
      },
    });
    if (error) {
      setLoading(false);
      return toast.error("No pudimos guardar tus datos. Inténtalo de nuevo.");
    }
    savePendingJoin(parsed.data as { full_name: string; email: string; phone: string });
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (oauthError) {
      setLoading(false);
      toast.error("No pudimos entrar con Google");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">
      <Input required placeholder="Nombre completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-12 rounded-xl" />
      <Input type="email" required placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl" />
      <Input type="tel" required placeholder="Celular (ej. +57 300 000 0000)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-xl" />
      <Button type="submit" className="w-full rounded-full h-12" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unirme y entrar con Google"}
      </Button>
      <p className="text-xs text-muted-foreground">Es gratis. Entrarás directo al chat de la comunidad.</p>
    </form>
  );
};
