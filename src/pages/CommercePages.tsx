import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2, Lock } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout, PageHero } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { cart, useCart } from "@/lib/cart";
import { toast } from "sonner";

const money = (n: number, c = "USD") => new Intl.NumberFormat("es-CO", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export const useCatalog = () =>
  useQuery({
    queryKey: ["catalog-products"],
    queryFn: async () => {
      const [p, t] = await Promise.all([
        supabase.from("programs").select("id,title,description,thumbnail_url,price,currency").eq("visibility_status", "published").order("sort_order"),
        supabase.from("tools").select("id,title,description,thumbnail_url,price_monthly,currency").eq("visibility_status", "published").order("sort_order"),
      ]);
      return [
        ...(p.data ?? []).map((x) => ({ type: "program" as const, id: x.id, title: x.title, description: x.description, image: x.thumbnail_url, price: Number(x.price), currency: x.currency })),
        ...(t.data ?? []).map((x) => ({ type: "tool" as const, id: x.id, title: x.title, description: x.description, image: x.thumbnail_url, price: Number(x.price_monthly), currency: x.currency })),
      ];
    },
  });

export const CartPage = () => {
  const items = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const { data = [], isLoading } = useCatalog();
  const [paying, setPaying] = useState(false);
  const lines = items.map((i) => data.find((d) => d.type === i.type && d.id === i.id)).filter(Boolean) as typeof data;
  const estimate = lines.reduce((s, l) => s + l.price, 0);

  const pay = async () => {
    if (!user) return nav("/login");
    setPaying(true);
    const { data: res, error } = await supabase.functions.invoke("create-checkout", { body: { items } });
    setPaying(false);
    if (error) {
      const body = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
      toast.error(body?.message ?? body?.error ?? "No se pudo iniciar el pago");
      return;
    }
    if (res?.url) window.location.href = res.url;
  };

  return (
    <PublicLayout>
      <PageHero kicker="Carrito" title="Tu" accent="carrito." text="El precio final lo confirma el servidor al pagar." />
      <section className="mx-auto grid max-w-5xl gap-8 px-5 pb-24 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {isLoading && <Loader2 className="animate-spin" />}
          {!isLoading && lines.length === 0 && (
            <div className="rounded-3xl bg-card p-10 text-center">
              <p className="text-muted-foreground">Tu carrito está vacío.</p>
              <Button asChild className="mt-4 rounded-full"><Link to="/marketplace">Ir al marketplace</Link></Button>
            </div>
          )}
          {lines.map((l) => (
            <div key={l.type + l.id} className="flex items-center gap-4 rounded-3xl bg-card p-4">
              {l.image && <img src={l.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />}
              <div className="flex-1">
                <p className="font-heading text-lg font-semibold">{l.title}</p>
                <p className="text-sm text-muted-foreground">{l.type === "program" ? "Curso" : "Herramienta"}</p>
              </div>
              <p className="font-heading font-semibold">{money(l.price, l.currency)}</p>
              <Button variant="ghost" size="icon" aria-label="Quitar" onClick={() => cart.remove(l)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <aside className="h-fit space-y-4 rounded-3xl bg-card p-6">
            <div className="flex justify-between text-sm text-muted-foreground"><span>Total estimado</span><span>{money(estimate, lines[0].currency)}</span></div>
            <Button className="w-full rounded-full" size="lg" onClick={pay} disabled={paying}>
              {paying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Pagar con Whop
            </Button>
            <Button className="w-full rounded-full" size="lg" variant="outline" disabled>
              <Lock className="mr-2 h-4 w-4" /> Wompi Colombia — pendiente
            </Button>
            <p className="text-xs text-muted-foreground">Whop y Wompi todavía no están activados. No se realizará ningún cobro.</p>
          </aside>
        )}
      </section>
    </PublicLayout>
  );
};

export const OrdersPage = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id,status,total_amount,currency,created_at,order_items(title)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PublicLayout>
      <PageHero kicker="Cuenta" title="Mis" accent="compras." text="Historial de pedidos." />
      <section className="mx-auto max-w-4xl space-y-3 px-5 pb-24">
        {isLoading && <Loader2 className="animate-spin" />}
        {!isLoading && data.length === 0 && <p className="text-muted-foreground">Aún no tienes compras.</p>}
        {data.map((o: any) => (
          <div key={o.id} className="flex justify-between rounded-3xl bg-card p-5">
            <div><p className="font-semibold">{o.order_items?.map((i: any) => i.title).join(", ")}</p><p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("es")}</p></div>
            <div className="text-right"><p className="font-semibold">{money(Number(o.total_amount), o.currency)}</p><p className="text-sm text-muted-foreground">{o.status === "paid" ? "Pagado" : o.status === "pending" ? "Pendiente" : o.status}</p></div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
};
