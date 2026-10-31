import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Member = { id: string; email: string; name: string | null; roles: string[]; status: string; last_sign_in_at: string | null };
const ROLES = [
  { key: "super_admin", label: "Super admin" },
  { key: "mentor", label: "Mentor" },
  { key: "member", label: "Miembro" },
];
const ACTIONS: Record<string, string> = {
  role_granted: "Rol otorgado", role_revoked: "Rol retirado", account_suspended: "Cuenta suspendida", account_activated: "Cuenta activada",
};

const call = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("admin-members", { body });
  if (error) {
    const d = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
    throw new Error(typeof d?.error === "string" ? d.error : "Error");
  }
  return data;
};

export default function AdminMembersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["admin-members"], queryFn: () => call({ action: "list" }) });
  const { data: audit } = useQuery({ queryKey: ["admin-audit"], queryFn: () => call({ action: "audit" }) });
  const members: Member[] = data?.members ?? [];
  const me: string | undefined = data?.me;
  const byId = (id: string) => members.find((m) => m.id === id)?.email ?? id.slice(0, 8);

  const run = async (key: string, body: Record<string, unknown>) => {
    setBusy(key);
    try {
      await call(body);
      toast.success("Guardado");
      qc.invalidateQueries({ queryKey: ["admin-members"] });
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const filtered = members.filter((m) => `${m.email} ${m.name ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
        <header>
          <h1 className="display text-4xl md:text-6xl">Miembros</h1>
          <p className="mt-2 text-muted-foreground">Roles, suspensiones e historial. Nadie puede cambiar su propia cuenta.</p>
        </header>
        <Input placeholder="Buscar por correo o nombre" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm rounded-full" />
        {isLoading ? <Loader2 className="animate-spin" /> : (
          <div className="overflow-x-auto rounded-3xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-left text-muted-foreground">
                <tr><th className="p-4">Miembro</th>{ROLES.map((r) => <th key={r.key} className="p-4">{r.label}</th>)}<th className="p-4">Estado</th></tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const self = m.id === me;
                  return (
                    <tr key={m.id} className="border-t border-border">
                      <td className="p-4"><p className="font-medium">{m.name || "—"}{self && " (tú)"}</p><p className="text-muted-foreground">{m.email}</p></td>
                      {ROLES.map((r) => (
                        <td key={r.key} className="p-4">
                          <Switch
                            checked={m.roles.includes(r.key)}
                            disabled={self || busy !== null}
                            onCheckedChange={(v) => run(m.id + r.key, { action: "set_role", user_id: m.id, role: r.key, enabled: v })}
                            aria-label={`${r.label} para ${m.email}`}
                          />
                        </td>
                      ))}
                      <td className="p-4">
                        <Button
                          size="sm" variant={m.status === "suspended" ? "default" : "outline"} className="rounded-full" disabled={self || busy !== null}
                          onClick={() => run(m.id + "s", { action: "set_status", user_id: m.id, status: m.status === "suspended" ? "active" : "suspended" })}
                        >
                          {m.status === "suspended" ? "Activar" : "Suspender"}
                        </Button>
                        {m.status === "suspended" && <p className="mt-1 text-xs text-destructive">Suspendida</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <section>
          <h2 className="font-heading text-2xl font-semibold">Historial</h2>
          <div className="mt-4 space-y-2">
            {(audit?.entries ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sin cambios registrados todavía.</p>}
            {(audit?.entries ?? []).map((e: any) => (
              <div key={e.id} className="flex flex-wrap justify-between gap-2 rounded-2xl bg-card px-4 py-3 text-sm">
                <span><b>{ACTIONS[e.action] ?? e.action}</b>{e.details?.role ? ` · ${e.details.role}` : ""} → {byId(e.target_user_id)}</span>
                <span className="text-muted-foreground">por {e.actor_id ? byId(e.actor_id) : "sistema"} · {new Date(e.created_at).toLocaleString("es")}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
