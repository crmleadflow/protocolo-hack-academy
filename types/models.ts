import type { ObjectId } from "mongodb";

export type MemberRole = "super_admin" | "mentor" | "miembro";
export type MemberStatus = "active" | "disabled";

export interface Member {
  _id?: ObjectId;
  email: string;
  name: string;
  phone?: string | null;
  status: MemberStatus;
  role: MemberRole;
  crmLeadId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  _id?: ObjectId;
  slug: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  published: boolean;
  isFree: boolean;
  priceOfferId?: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  _id?: ObjectId;
  courseId: ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  _id?: ObjectId;
  courseId: ObjectId;
  moduleId: ObjectId;
  title: string;
  order: number;
  videoProvider: "youtube" | "bunny" | "mux";
  videoId: string;
  durationSeconds?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  _id?: ObjectId;
  memberId: ObjectId;
  courseId: ObjectId;
  source: "free" | "offer" | "admin_grant";
  offerId?: ObjectId | null;
  createdAt: Date;
}

export interface LessonProgress {
  _id?: ObjectId;
  memberId: ObjectId;
  courseId: ObjectId;
  lessonId: ObjectId;
  completed: boolean;
  completedAt?: Date | null;
  updatedAt: Date;
}

export type EventKind = "webinar" | "llamada";

export interface CommunityEvent {
  _id?: ObjectId;
  title: string;
  description: string;
  kind: EventKind;
  startsAt: Date;
  zoomUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  _id?: ObjectId;
  eventId: ObjectId;
  memberId: ObjectId;
  createdAt: Date;
}

export interface MentorshipProgram {
  _id?: ObjectId;
  title: string;
  description: string;
  mentorMemberId: ObjectId;
  offerId?: ObjectId | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipSlot {
  _id?: ObjectId;
  programId: ObjectId;
  startsAt: Date;
  durationMinutes: number;
  booked: boolean;
  createdAt: Date;
}

export interface MentorshipBooking {
  _id?: ObjectId;
  programId: ObjectId;
  slotId: ObjectId;
  memberId: ObjectId;
  createdAt: Date;
}

export interface Space {
  _id?: ObjectId;
  slug: string;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
}

export interface Thread {
  _id?: ObjectId;
  spaceId: ObjectId;
  memberId: ObjectId;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  _id?: ObjectId;
  threadId: ObjectId;
  memberId: ObjectId;
  body: string;
  createdAt: Date;
}

// "plugin": complemento/addon vendido suelto (no es un curso ni una mentoría).
// "crm_plan": un plan de Lead Flow CRM — se vende acá como catálogo, pero el
// alta real de la cuenta del CRM la hace Hector a mano (ver nota en refId).
// "speaking": contratación para charlas/conferencias — precio a medida, no
// tiene checkout: el botón manda una intención de compra (igual que "agendar
// llamada") para que Hector cierre el trato a mano.
export type OfferKind = "course" | "mentorship" | "plugin" | "crm_plan" | "speaking";
export type OfferCurrency = "USD" | "COP";

export interface Offer {
  _id?: ObjectId;
  title: string;
  description: string;
  kind: OfferKind;
  // courseId o programId cuando kind es "course"/"mentorship". Para
  // "plugin" y "crm_plan" no hay un documento propio todavía: refId queda
  // null y la entrega es manual (ver CLAUDE.md "Pendientes").
  refId: ObjectId | null;
  priceCents: number;
  currency: OfferCurrency;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  _id?: ObjectId;
  memberId: ObjectId;
  offerId: ObjectId;
  provider: "stripe" | "wompi";
  providerRef: string; // checkout/session id del proveedor
  status: "pending" | "paid" | "failed";
  amountCents: number;
  currency: OfferCurrency;
  createdAt: Date;
  updatedAt: Date;
}

export type IntentEventKind = "resource_request" | "offer_click" | "book_call";

export interface IntentEvent {
  _id?: ObjectId;
  memberId: ObjectId;
  kind: IntentEventKind;
  offerId?: ObjectId | null;
  resourceId?: ObjectId | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type CrmOutboxStatus = "pending" | "sent" | "failed";

export interface CrmOutboxItem {
  _id?: ObjectId;
  memberId: ObjectId; // único por miembro — ver índice en lib/db.ts
  intentEventId: ObjectId;
  status: CrmOutboxStatus;
  attempts: number;
  lastError?: string | null;
  crmLeadId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  _id?: ObjectId;
  slug: string;
  title: string;
  description: string;
  fileUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogEntry {
  _id?: ObjectId;
  actorMemberId: ObjectId | null;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}
