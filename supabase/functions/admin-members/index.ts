import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const ROLES = ["super_admin", "admin", "mentor", "member", "student"] as const;
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("set_role"), user_id: z.string().uuid(), role: z.enum(ROLES), enabled: z.boolean() }),
  z.object({ action: z.literal("set_status"), user_id: z.string().uuid(), status: z.enum(["active", "suspended"]), reason: z.string().max(300).optional() }),
  z.object({ action: z.literal("audit") }),
]);

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "No autorizado" }, 401);
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u.user) return json({ error: "No autorizado" }, 401);
    const actor = u.user.id;

    const { data: actorRoles } = await admin.from("user_roles").select("role").eq("user_id", actor);
    const ar = (actorRoles ?? []).map((r) => r.role as string);
    const isSuper = ar.includes("super_admin");
    if (!isSuper && !ar.includes("admin")) return json({ error: "Solo administradores" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const b = parsed.data;

    if (b.action === "list") {
      const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const [{ data: roles }, { data: statuses }, { data: profiles }] = await Promise.all([
        admin.from("user_roles").select("user_id, role"),
        admin.from("account_status").select("user_id, status, reason"),
        admin.from("profiles").select("user_id, full_name"),
      ]);
      return json({
        me: actor,
        members: (users?.users ?? []).map((x) => ({
          id: x.id,
          email: x.email,
          name: profiles?.find((p) => p.user_id === x.id)?.full_name ?? null,
          created_at: x.created_at,
          last_sign_in_at: x.last_sign_in_at,
          roles: (roles ?? []).filter((r) => r.user_id === x.id).map((r) => r.role),
          status: statuses?.find((s) => s.user_id === x.id)?.status ?? "active",
        })),
      });
    }

    if (b.action === "audit") {
      const { data } = await admin.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100);
      return json({ entries: data ?? [] });
    }

    // Nobody can change their own role or status
    if (b.user_id === actor) return json({ error: "No puedes modificar tu propia cuenta" }, 403);
    const { data: targetRoles } = await admin.from("user_roles").select("role").eq("user_id", b.user_id);
    const targetIsPrivileged = (targetRoles ?? []).some((r) => r.role === "super_admin" || r.role === "admin");
    if (targetIsPrivileged && !isSuper) return json({ error: "Solo un super admin puede modificar a otro administrador" }, 403);

    if (b.action === "set_role") {
      if ((b.role === "super_admin" || b.role === "admin") && !isSuper)
        return json({ error: "Solo un super admin puede otorgar roles de administrador" }, 403);
      if (b.enabled) {
        const { error } = await admin.from("user_roles").upsert({ user_id: b.user_id, role: b.role }, { onConflict: "user_id,role", ignoreDuplicates: true });
        if (error) {
          const exists = (targetRoles ?? []).some((r) => r.role === b.role);
          if (!exists) {
            const { error: e2 } = await admin.from("user_roles").insert({ user_id: b.user_id, role: b.role });
            if (e2) return json({ error: e2.message }, 500);
          }
        }
      } else {
        const { error } = await admin.from("user_roles").delete().eq("user_id", b.user_id).eq("role", b.role);
        if (error) return json({ error: error.message }, 500);
      }
      await admin.from("audit_log").insert({ actor_id: actor, action: b.enabled ? "role_granted" : "role_revoked", target_user_id: b.user_id, details: { role: b.role } });
      return json({ ok: true });
    }

    // set_status: suspend blocks sign-in at the auth level
    const { error: banErr } = await admin.auth.admin.updateUserById(b.user_id, {
      ban_duration: b.status === "suspended" ? "876000h" : "none",
    });
    if (banErr) return json({ error: banErr.message }, 500);
    await admin.from("account_status").upsert({ user_id: b.user_id, status: b.status, reason: b.reason ?? null, updated_by: actor, updated_at: new Date().toISOString() });
    await admin.from("audit_log").insert({ actor_id: actor, action: b.status === "suspended" ? "account_suspended" : "account_activated", target_user_id: b.user_id, details: { reason: b.reason ?? null } });
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
