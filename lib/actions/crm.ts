"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/current-member";
import { retryAllPending } from "@/lib/crm/bridge";

export async function retryOutbox() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");
  await retryAllPending();
  revalidatePath("/admin/crm");
}
