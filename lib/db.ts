import clientPromise from "@/lib/mongodb";
import type { Db } from "mongodb";
import type {
  Member,
  Course,
  Module,
  Lesson,
  Enrollment,
  LessonProgress,
  CommunityEvent,
  EventRegistration,
  MentorshipProgram,
  MentorshipSlot,
  MentorshipBooking,
  Space,
  Thread,
  Reply,
  Offer,
  Purchase,
  IntentEvent,
  CrmOutboxItem,
  Resource,
  AuditLogEntry,
} from "@/types/models";

let indexesEnsured = false;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "protocolo_hack");
  if (!indexesEnsured) {
    indexesEnsured = true;
    await ensureIndexes(db).catch((err) =>
      console.error("[db] error creando índices:", err?.message)
    );
  }
  return db;
}

// Índices mínimos. `crm_outbox` necesita que `memberId` sea único: es lo que
// garantiza la idempotencia (un miembro nunca genera dos leads duplicados en
// el CRM aunque la intención de compra se repita o el CRM esté caído).
async function ensureIndexes(db: Db) {
  await db.collection("members").createIndex({ email: 1 }, { unique: true });
  await db.collection("courses").createIndex({ slug: 1 }, { unique: true });
  await db.collection("resources").createIndex({ slug: 1 }, { unique: true });
  await db.collection("spaces").createIndex({ slug: 1 }, { unique: true });
  await db.collection("crm_outbox").createIndex({ memberId: 1 }, { unique: true });
  await db.collection("enrollments").createIndex({ memberId: 1, courseId: 1 }, { unique: true });
  await db
    .collection("lesson_progress")
    .createIndex({ memberId: 1, lessonId: 1 }, { unique: true });
}

export const Collections = {
  members: async () => (await getDb()).collection<Member>("members"),
  courses: async () => (await getDb()).collection<Course>("courses"),
  modules: async () => (await getDb()).collection<Module>("modules"),
  lessons: async () => (await getDb()).collection<Lesson>("lessons"),
  enrollments: async () => (await getDb()).collection<Enrollment>("enrollments"),
  lessonProgress: async () => (await getDb()).collection<LessonProgress>("lesson_progress"),
  events: async () => (await getDb()).collection<CommunityEvent>("events"),
  eventRegistrations: async () =>
    (await getDb()).collection<EventRegistration>("event_registrations"),
  mentorshipPrograms: async () =>
    (await getDb()).collection<MentorshipProgram>("mentorship_programs"),
  mentorshipSlots: async () => (await getDb()).collection<MentorshipSlot>("mentorship_slots"),
  mentorshipBookings: async () =>
    (await getDb()).collection<MentorshipBooking>("mentorship_bookings"),
  spaces: async () => (await getDb()).collection<Space>("spaces"),
  threads: async () => (await getDb()).collection<Thread>("threads"),
  replies: async () => (await getDb()).collection<Reply>("replies"),
  offers: async () => (await getDb()).collection<Offer>("offers"),
  purchases: async () => (await getDb()).collection<Purchase>("purchases"),
  intentEvents: async () => (await getDb()).collection<IntentEvent>("intent_events"),
  crmOutbox: async () => (await getDb()).collection<CrmOutboxItem>("crm_outbox"),
  resources: async () => (await getDb()).collection<Resource>("resources"),
  auditLog: async () => (await getDb()).collection<AuditLogEntry>("audit_log"),
};
