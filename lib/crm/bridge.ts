import { ObjectId } from "mongodb";
import { Collections } from "@/lib/db";
import type { IntentEventKind, Member } from "@/types/models";

/**
 * Puente de "intención de compra" hacia Lead Flow CRM.
 *
 * Opción A del arquitecto: cero cambios en el repo del CRM. Se usa el
 * endpoint que ya existe ahí, POST /api/webhooks/lead/[token] (patrón
 * "landing externa"). El token lo genera Hector desde la UI del CRM.
 *
 * Todo pasa primero por `intent_events` (registro permanente de la
 * intención) y después por `crm_outbox` (bandeja de reintento, única por
 * miembro) antes de intentar la llamada HTTP. Así nunca se pierde una
 * intención aunque el CRM esté caído, y nunca se duplica un lead.
 */

export async function registerIntentAndQueue(
  member: Member & { _id: ObjectId },
  kind: IntentEventKind,
  extra: { offerId?: ObjectId; resourceId?: ObjectId; metadata?: Record<string, unknown> } = {}
): Promise<void> {
  const intentEvents = await Collections.intentEvents();
  const { insertedId } = await intentEvents.insertOne({
    memberId: member._id,
    kind,
    offerId: extra.offerId ?? null,
    resourceId: extra.resourceId ?? null,
    metadata: extra.metadata ?? {},
    createdAt: new Date(),
  });

  const outbox = await Collections.crmOutbox();
  const existing = await outbox.findOne({ memberId: member._id });
  if (!existing) {
    await outbox.insertOne({
      memberId: member._id,
      intentEventId: insertedId,
      status: "pending",
      attempts: 0,
      lastError: null,
      crmLeadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Intento inmediato. Si falla (token no configurado, CRM caído, etc.) se
  // traga el error a propósito: la experiencia del miembro no depende del
  // CRM, y el reintento posterior (panel de admin) lo recupera.
  await attemptSendToCrm(member._id).catch(() => {});
}

export async function attemptSendToCrm(memberId: ObjectId): Promise<void> {
  const outbox = await Collections.crmOutbox();
  const item = await outbox.findOne({ memberId });
  if (!item || item.status === "sent") return;

  const token = process.env.LEADFLOW_CRM_WEBHOOK_TOKEN;
  const baseUrl = process.env.LEADFLOW_CRM_BASE_URL;

  if (!token || !baseUrl) {
    await outbox.updateOne(
      { _id: item._id },
      {
        $set: {
          lastError: "LEADFLOW_CRM_WEBHOOK_TOKEN o LEADFLOW_CRM_BASE_URL sin configurar todavía",
          updatedAt: new Date(),
        },
        $inc: { attempts: 1 },
      }
    );
    return;
  }

  const members = await Collections.members();
  const member = await members.findOne({ _id: memberId });
  if (!member) return;

  try {
    const res = await fetch(`${baseUrl}/api/webhooks/lead/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: member.name,
        email: member.email,
        // NO se manda `phone`, A PROPÓSITO. Ese endpoint del CRM dispara un
        // WhatsApp automático (Sophia) en cuanto recibe un teléfono, y por
        // ahora Hector decidió que nadie reciba mensajes automáticos todavía.
        // No agregar `phone` aquí sin su autorización explícita.
        source: "protocolo_hack_academy",
        page_url: process.env.NEXT_PUBLIC_APP_URL || undefined,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `El CRM respondió ${res.status}`);
    }

    await outbox.updateOne(
      { _id: item._id },
      {
        $set: {
          status: "sent",
          crmLeadId: data.lead_id || null,
          lastError: null,
          updatedAt: new Date(),
        },
        $inc: { attempts: 1 },
      }
    );
    await members.updateOne(
      { _id: memberId },
      { $set: { crmLeadId: data.lead_id || null, updatedAt: new Date() } }
    );
  } catch (err) {
    await outbox.updateOne(
      { _id: item._id },
      {
        $set: { status: "failed", lastError: (err as Error).message, updatedAt: new Date() },
        $inc: { attempts: 1 },
      }
    );
  }
}

export async function retryAllPending(): Promise<{ attempted: number }> {
  const outbox = await Collections.crmOutbox();
  const pending = await outbox.find({ status: { $in: ["pending", "failed"] } }).toArray();
  for (const item of pending) {
    await attemptSendToCrm(item.memberId);
  }
  return { attempted: pending.length };
}
