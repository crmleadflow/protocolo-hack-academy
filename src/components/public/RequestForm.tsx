import { useState } from "react";
import { z } from "zod";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre").max(120),
  email: z.string().trim().email("Correo no válido").max(255),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});

type Props = {
  type: "conferencia" | "mentoria" | "leadflow" | "recurso" | "evento" | "contacto" | "seminario" | "capacitacion" | "bootcamp";
  title: string;
  cta?: string;
  showCompany?: boolean;
  context?: string;
};

export const RequestForm = ({ type, title, cta = "Enviar solicitud", showCompany, context }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const sp = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => { const v = sp.get(k); if (v) utm[k] = v; });
    const { error } = await supabase.functions.invoke("submit-request", {
      body: {
        request_type: type,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        message: [context, parsed.data.message].filter(Boolean).join(" — ") || null,
        page_url: window.location.href.split("#")[0],
        utm,
      },
    });
    setLoading(false);
    if (error) {
      toast.error("No pudimos enviar tu solicitud. Inténtalo de nuevo.");
      return;
    }
    setDone(true);
    toast.success("¡Recibido! Te contactaremos pronto.");
  };

  if (done)
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check />
        </div>
        <p className="mt-4 font-heading text-xl font-semibold">Solicitud enviada</p>
        <p className="mt-1 text-sm text-muted-foreground">Guardamos tu solicitud. Nuestro equipo la revisará.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-3">
      <p className="font-heading text-xl font-semibold">{title}</p>
      <Input name="name" placeholder="Nombre completo" required defaultValue={user?.user_metadata?.full_name ?? ""} />
      <Input name="email" type="email" placeholder="Correo" required defaultValue={user?.email ?? ""} />
      <Input name="phone" placeholder="Teléfono (opcional)" />
      {showCompany && <Input name="company" placeholder="Empresa" />}
      <Textarea name="message" placeholder="Cuéntanos qué necesitas" rows={4} />
      <Button type="submit" className="w-full rounded-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {cta}
      </Button>
    </form>
  );
};
