"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/current-member";
import { Collections } from "@/lib/db";
import { signIn } from "@/auth";
import type { MemberRole, MemberStatus } from "@/types/models";

// "Invitar" acá significa: dar de alta al miembro YA activo (sin cola de
// aprobación, como lo pidió Hector) y mandarle el enlace mágico para entrar.
export async function inviteMember(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  if (!email) throw new Error("Falta el correo");

  const members = await Collections.members();
  const existing = await members.findOne({ email });
  if (!existing) {
    const now = new Date();
    await members.insertOne({
      email,
      name: name || email.split("@")[0],
      phone: null,
      status: "active",
      role: "miembro",
      crmLeadId: null,
      createdAt: now,
      updatedAt: now,
    });
    const auditLog = await Collections.auditLog();
    await auditLog.insertOne({
      actorMemberId: admin._id,
      action: "member.invited",
      targetType: "member",
      targetId: email,
      createdAt: new Date(),
    });
  }

  await signIn("resend", { email, redirect: false }).catch((err) => {
    console.error("[inviteMember] error enviando el enlace:", (err as Error)?.message);
  });

  revalidatePath("/admin/miembros");
}

export async function setMemberRole(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const memberId = String(formData.get("memberId"));
  const role = String(formData.get("role")) as MemberRole;

  const members = await Collections.members();
  await members.updateOne(
    { _id: new ObjectId(memberId) },
    { $set: { role, updatedAt: new Date() } }
  );

  const auditLog = await Collections.auditLog();
  await auditLog.insertOne({
    actorMemberId: admin._id,
    action: "member.role_changed",
    targetType: "member",
    targetId: memberId,
    details: { role },
    createdAt: new Date(),
  });

  revalidatePath("/admin/miembros");
}

export async function setMemberStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const memberId = String(formData.get("memberId"));
  const status = String(formData.get("status")) as MemberStatus;

  const members = await Collections.members();
  await members.updateOne(
    { _id: new ObjectId(memberId) },
    { $set: { status, updatedAt: new Date() } }
  );

  const auditLog = await Collections.auditLog();
  await auditLog.insertOne({
    actorMemberId: admin._id,
    action: "member.status_changed",
    targetType: "member",
    targetId: memberId,
    details: { status },
    createdAt: new Date(),
  });

  revalidatePath("/admin/miembros");
}
