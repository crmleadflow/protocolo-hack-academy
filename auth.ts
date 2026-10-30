import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { Collections } from "@/lib/db";
import type { Member } from "@/types/models";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB || "protocolo_hack",
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login", verifyRequest: "/login/revisa-tu-correo" },
  events: {
    // Primer login de un correo nuevo: nace como miembro activo de una vez,
    // sin cola de aprobación (así lo pidió Hector — "que entren sin aprobar").
    async createUser({ user }) {
      if (!user.email) return;
      const members = await Collections.members();
      const existing = await members.findOne({ email: user.email });
      if (existing) return;
      const now = new Date();
      // Arranque en frío: el/los correos en SUPER_ADMIN_EMAILS (separados por
      // coma) entran como super_admin desde el primer login. Sin esto nadie
      // podría llegar nunca al panel de admin.
      const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const doc: Member = {
        email: user.email,
        name: user.name || user.email.split("@")[0],
        phone: null,
        status: "active",
        role: superAdmins.includes(user.email.toLowerCase()) ? "super_admin" : "miembro",
        crmLeadId: null,
        createdAt: now,
        updatedAt: now,
      };
      await members.insertOne(doc);
    },
  },
  callbacks: {
    // Un miembro deshabilitado por el admin no puede volver a entrar aunque
    // tenga el enlace mágico en el correo.
    async signIn({ user }) {
      if (!user.email) return false;
      const members = await Collections.members();
      const member = await members.findOne({ email: user.email });
      if (member && member.status === "disabled") return false;
      return true;
    },
    async session({ session, user }) {
      if (session.user && user?.email) {
        const members = await Collections.members();
        const member = await members.findOne({ email: user.email });
        if (member) {
          session.user.id = String(member._id);
          session.user.role = member.role;
          session.user.status = member.status;
        }
      }
      return session;
    },
  },
});
