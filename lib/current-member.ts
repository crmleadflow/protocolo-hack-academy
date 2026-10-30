import { auth } from "@/auth";
import { Collections } from "@/lib/db";
import type { Member } from "@/types/models";
import type { ObjectId } from "mongodb";

export type MemberWithId = Member & { _id: ObjectId };

export async function getCurrentMember(): Promise<MemberWithId | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const members = await Collections.members();
  const member = await members.findOne({ email: session.user.email });
  return (member as MemberWithId) || null;
}

export async function requireAdmin(): Promise<MemberWithId | null> {
  const member = await getCurrentMember();
  if (!member || member.role !== "super_admin") return null;
  return member;
}
