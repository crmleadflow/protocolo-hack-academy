import { Collections } from "@/lib/db";
import type { MemberWithId } from "@/lib/current-member";

// Usado por los formularios públicos (recursos gratis, ofertas) para dar de
// alta a alguien que todavía no tiene cuenta, sin pedirle que haga login.
// Si ya existe por correo, se actualiza el teléfono si llegó uno nuevo.
export async function findOrCreateMemberByEmail(
  email: string,
  name: string,
  phone?: string | null
): Promise<MemberWithId> {
  const members = await Collections.members();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await members.findOne({ email: normalizedEmail });
  if (existing) {
    if (phone && !existing.phone) {
      await members.updateOne(
        { _id: existing._id },
        { $set: { phone, updatedAt: new Date() } }
      );
      existing.phone = phone;
    }
    return existing as MemberWithId;
  }

  const now = new Date();
  const doc = {
    email: normalizedEmail,
    name: name.trim() || normalizedEmail.split("@")[0],
    phone: phone || null,
    status: "active" as const,
    role: "miembro" as const,
    crmLeadId: null,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await members.insertOne(doc);
  return { ...doc, _id: insertedId };
}
