import type { MemberRole, MemberStatus } from "@/types/models";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: MemberRole;
      status?: MemberStatus;
    } & DefaultSessionUser;
  }
}

type DefaultSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
