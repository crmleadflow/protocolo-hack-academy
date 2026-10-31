import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";

const STATUS: Record<string, string> = { pending: "Pendiente de envío", sent: "Enviada a Lead Flow", failed: "Falló el envío" };

export default function AdminLeadsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("commercial_requests").select("*").order("created_at", { ascending: false }).limit(200);
      const { data: intents } = await supabase.from("intent_events").select("id,request_id");
      const { data: outbox } = await supabase.from("crm_outbox").select("intent_event_id,status,last_error");
      return (data ?? []).map((r) => {
        const ie = intents?.find((i) => i.request_id === r.id);
        const ob = ie ? outbox?.find((o) => o.intent_event_id === ie.id) : undefined;
        return { ...r, crm: ob?.status ?? null, crm_error: ob?.last_error ?? null };
      });
    },
  });
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <header>
          <h1 className="display text-4xl md:text-6xl">Oportunidades</h1>
          <p className="mt-2 text-muted-foreground">Solicitudes de los formularios. El envío a Lead Flow queda pendiente hasta conectar el CRM. El teléfono nunca se envía al CRM.</p>
        </header>
        {isLoading ? <Loader2 className="animate-spin" /> : data.length === 0 ? <p className="text-muted-foreground">Aún no hay solicitudes.</p> : (
          <div className="space-y-2">
            {data.map((r) => (
              <div key={r.id} className="grid gap-1 rounded-2xl bg-card p-4 text-sm md:grid-cols-[1fr_1fr_auto]">
                <div><p className="font-medium">{r.name}</p><p className="text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p></div>
                <div><p className="capitalize">{r.request_type}</p><p className="line-clamp-2 text-muted-foreground">{r.message}</p></div>
                <div className="text-right"><p>{r.crm ? STATUS[r.crm] : "Sin registro CRM"}</p><p className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString("es")}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
