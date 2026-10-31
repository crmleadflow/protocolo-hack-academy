import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ---------- Tipos ----------

export interface Challenge {
  id: string;
  program_id: string;
  title: string;
  description: string;
  xp_reward: number;
  due_date: string | null;
  status: "open" | "closed";
  created_at: string;
}

export interface Participation {
  id: string;
  challenge_id: string;
  user_id: string;
  status: "joined" | "submitted" | "completed";
  submission_text: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface CommunityEvent {
  id: string;
  program_id: string | null;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  meeting_url: string;
  status: "scheduled" | "cancelled" | "done";
  created_at: string;
}

export interface Opportunity {
  id: string;
  program_id: string | null;
  title: string;
  description: string;
  contact_email: string;
  link: string;
  status: "open" | "closed";
  created_at: string;
}

export interface MemberRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  connection_status: string;
}

// ---------- Retos y misiones ----------

export function useChallenges(programId: string | null, isStaff: boolean) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [mine, setMine] = useState<Participation[]>([]);
  const [submissions, setSubmissions] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programId) {
      setChallenges([]);
      setMine([]);
      setSubmissions([]);
      return;
    }
    setLoading(true);

    const [{ data: ch }, { data: parts }, { data: { user } }] = await Promise.all([
      supabase
        .from("community_challenges")
        .select("*")
        .eq("program_id", programId)
        .order("status", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase.from("challenge_participants").select("*"),
      supabase.auth.getUser(),
    ]);

    setChallenges((ch as Challenge[]) || []);
    const all = (parts as Participation[]) || [];
    setMine(all.filter((p) => p.user_id === user?.id));
    setSubmissions(isStaff ? all.filter((p) => p.status === "submitted") : []);

    setLoading(false);
  }, [programId, isStaff]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myPartFor = useCallback(
    (challengeId: string) => mine.find((p) => p.challenge_id === challengeId),
    [mine]
  );

  const join = useCallback(
    async (challengeId: string) => {
      const { error } = await supabase.rpc("join_challenge", { _challenge_id: challengeId });
      if (error) toast.error(error.message);
      else {
        toast.success("Te uniste al reto");
        refresh();
      }
    },
    [refresh]
  );

  const submit = useCallback(
    async (challengeId: string, text: string) => {
      const { error } = await supabase.rpc("submit_challenge", {
        _challenge_id: challengeId,
        _submission_text: text,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Entrega enviada. El equipo la revisará.");
        refresh();
      }
    },
    [refresh]
  );

  const review = useCallback(
    async (challengeId: string, userId: string, approve: boolean) => {
      const { error } = await supabase.rpc("review_challenge", {
        _challenge_id: challengeId,
        _user_id: userId,
        _approve: approve,
      });
      if (error) toast.error(error.message);
      else {
        toast.success(approve ? "Reto completado y puntos entregados" : "Entrega devuelta");
        refresh();
      }
    },
    [refresh]
  );

  const create = useCallback(
    async (input: {
      title: string;
      description: string;
      xp_reward: number;
      due_date: string | null;
    }) => {
      if (!programId) return;
      const { error } = await supabase.from("community_challenges").insert({
        program_id: programId,
        title: input.title,
        description: input.description,
        xp_reward: input.xp_reward,
        due_date: input.due_date,
        status: "open",
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Reto publicado");
        refresh();
      }
    },
    [programId, refresh]
  );

  const setStatus = useCallback(
    async (challengeId: string, status: "open" | "closed") => {
      const { error } = await supabase
        .from("community_challenges")
        .update({ status })
        .eq("id", challengeId);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (challengeId: string) => {
      const { error } = await supabase
        .from("community_challenges")
        .delete()
        .eq("id", challengeId);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  return {
    challenges,
    loading,
    refresh,
    myPartFor,
    join,
    submit,
    review,
    create,
    setStatus,
    remove,
    submissions,
  };
}

// ---------- Eventos en vivo ----------

export function useEvents(programId: string | null, isStaff: boolean) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [rsvps, setRsvps] = useState<{ event_id: string; user_id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programId) {
      setEvents([]);
      setRsvps([]);
      return;
    }
    setLoading(true);
    const [{ data: ev }, { data: rs }] = await Promise.all([
      supabase
        .from("community_events")
        .select("*")
        .or(`program_id.eq.${programId},program_id.is.null`)
        .order("starts_at", { ascending: true }),
      supabase.from("event_rsvps").select("event_id, user_id"),
    ]);
    setEvents((ev as CommunityEvent[]) || []);
    setRsvps((rs as { event_id: string; user_id: string }[]) || []);
    setLoading(false);
  }, [programId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const attending = useCallback(
    (eventId: string, userId: string) =>
      rsvps.some((r) => r.event_id === eventId && r.user_id === userId),
    [rsvps]
  );

  const attendeeCount = useCallback(
    (eventId: string) => rsvps.filter((r) => r.event_id === eventId).length,
    [rsvps]
  );

  const toggleRsvp = useCallback(
    async (eventId: string, userId: string, going: boolean) => {
      if (going) {
        const { error } = await supabase
          .from("event_rsvps")
          .insert({ event_id: eventId, user_id: userId });
        if (error && !error.message.includes("duplicate key")) toast.error(error.message);
      } else {
        const { error } = await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", userId);
        if (error) toast.error(error.message);
      }
      refresh();
    },
    [refresh]
  );

  const create = useCallback(
    async (input: {
      title: string;
      description: string;
      starts_at: string;
      meeting_url: string;
      global: boolean;
    }) => {
      const { error } = await supabase.from("community_events").insert({
        program_id: input.global ? null : programId,
        title: input.title,
        description: input.description,
        starts_at: input.starts_at,
        meeting_url: input.meeting_url,
        status: "scheduled",
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Evento creado");
        refresh();
      }
    },
    [programId, refresh]
  );

  const setStatus = useCallback(
    async (eventId: string, status: "scheduled" | "cancelled" | "done") => {
      const { error } = await supabase
        .from("community_events")
        .update({ status })
        .eq("id", eventId);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (eventId: string) => {
      const { error } = await supabase.from("community_events").delete().eq("id", eventId);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  return {
    events,
    loading,
    refresh,
    attending,
    attendeeCount,
    toggleRsvp,
    create,
    setStatus,
    remove,
    isStaff,
  };
}

// ---------- Oportunidades comerciales ----------

export function useOpportunities(programId: string | null, isStaff: boolean) {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [responses, setResponses] = useState<
    { opportunity_id: string; user_id: string; message: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programId) {
      setItems([]);
      setResponses([]);
      return;
    }
    setLoading(true);
    const [{ data: op }, { data: rs }] = await Promise.all([
      supabase
        .from("community_opportunities")
        .select("*")
        .or(`program_id.eq.${programId},program_id.is.null`)
        .order("created_at", { ascending: false }),
      supabase.from("opportunity_responses").select("opportunity_id, user_id, message"),
    ]);
    setItems((op as Opportunity[]) || []);
    setResponses((rs as { opportunity_id: string; user_id: string; message: string }[]) || []);
    setLoading(false);
  }, [programId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myResponse = useCallback(
    (opportunityId: string, userId: string) =>
      responses.find((r) => r.opportunity_id === opportunityId && r.user_id === userId),
    [responses]
  );

  const respond = useCallback(
    async (opportunityId: string, userId: string, message: string) => {
      const { error } = await supabase.from("opportunity_responses").upsert(
        { opportunity_id: opportunityId, user_id: userId, message },
        { onConflict: "opportunity_id,user_id" }
      );
      if (error) toast.error(error.message);
      else {
        toast.success("Postulación enviada");
        refresh();
      }
    },
    [refresh]
  );

  const create = useCallback(
    async (input: {
      title: string;
      description: string;
      contact_email: string;
      link: string;
      global: boolean;
    }) => {
      const { error } = await supabase.from("community_opportunities").insert({
        program_id: input.global ? null : programId,
        title: input.title,
        description: input.description,
        contact_email: input.contact_email,
        link: input.link,
        status: "open",
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Oportunidad publicada");
        refresh();
      }
    },
    [programId, refresh]
  );

  const setStatus = useCallback(
    async (id: string, status: "open" | "closed") => {
      const { error } = await supabase
        .from("community_opportunities")
        .update({ status })
        .eq("id", id);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("community_opportunities").delete().eq("id", id);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  return {
    items,
    loading,
    refresh,
    myResponse,
    respond,
    create,
    setStatus,
    remove,
    responseCount: (id: string) => responses.filter((r) => r.opportunity_id === id).length,
    isStaff,
  };
}

// ---------- Ranking ----------

export function useLeaderboard(programId: string | null) {
  const [rows, setRows] = useState<
    {
      user_id: string;
      full_name: string;
      total_xp: number;
      current_level: number;
      avatar_url: string | null;
    }[]
  >([]);
  const [mine, setMine] = useState<{ total_xp: number; current_level: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programId) {
      setRows([]);
      return;
    }
    setLoading(true);
    const [{ data: lb }, { data: own }] = await Promise.all([
      supabase.rpc("community_leaderboard", { _program_id: programId, _limit: 20 }),
      supabase.from("user_xp").select("total_xp, current_level").maybeSingle(),
    ]);
    setRows((lb as any) || []);
    setMine(own as { total_xp: number; current_level: number } | null);
    setLoading(false);
  }, [programId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, mine, loading, refresh };
}

// ---------- Miembros / networking ----------

export function useMembers(programId: string | null) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [incoming, setIncoming] = useState<
    { id: string; from_user_id: string; message: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programId) {
      setMembers([]);
      setIncoming([]);
      return;
    }
    setLoading(true);
    const [{ data: mb }, { data: inc }, { data: { user } }] = await Promise.all([
      supabase.rpc("community_members", { _program_id: programId }),
      supabase
        .from("member_connections")
        .select("id, from_user_id, to_user_id, message")
        .eq("status", "pending"),
      supabase.auth.getUser(),
    ]);
    setMembers((mb as MemberRow[]) || []);
    setIncoming(
      (
        (inc as {
          id: string;
          from_user_id: string;
          to_user_id: string;
          message: string;
        }[]) || []
      )
        .filter((r) => r.to_user_id === user?.id)
        .map((r) => ({ id: r.id, from_user_id: r.from_user_id, message: r.message }))
    );

    setLoading(false);
  }, [programId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(
    async (toUserId: string, message: string) => {
      const { error } = await supabase
        .from("member_connections")
        .insert({ from_user_id: (await supabase.auth.getUser()).data.user?.id, to_user_id: toUserId, message });
      if (error) toast.error(error.message);
      else {
        toast.success("Solicitud enviada");
        refresh();
      }
    },
    [refresh]
  );

  const respond = useCallback(
    async (connectionId: string, accept: boolean) => {
      const { error } = await supabase
        .from("member_connections")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", connectionId);
      if (error) toast.error(error.message);
      else {
        toast.success(accept ? "Conexión aceptada" : "Solicitud rechazada");
        refresh();
      }
    },
    [refresh]
  );

  return { members, incoming, loading, connect, respond, refresh };
}

// ---------- Nivel (mismos umbrales que el sistema de logros) ----------

const LEVELS = [
  { level: 1, xp: 0, name: "Novato" },
  { level: 2, xp: 100, name: "Aprendiz" },
  { level: 3, xp: 300, name: "Estudiante" },
  { level: 4, xp: 600, name: "Conocedor" },
  { level: 5, xp: 1000, name: "Avanzado" },
  { level: 6, xp: 1500, name: "Experto" },
  { level: 7, xp: 2500, name: "Maestro" },
  { level: 8, xp: 4000, name: "Gran Maestro" },
  { level: 9, xp: 6000, name: "Leyenda" },
  { level: 10, xp: 10000, name: "Élite" },
];

export function levelName(xp: number) {
  let current = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      break;
    }
  }
  return current.name;
}

