import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Poll {
  id: string;
  program_id: string;
  question: string;
  options: string[];
  status: "open" | "closed";
  created_at: string;
}

interface Vote {
  poll_id: string;
  user_id: string;
  option_index: number;
}

// Las tablas de encuestas son nuevas y aún no están en los tipos generados.
const db = supabase as any;

export function usePolls(programId: string | null, userId?: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programId) {
      setPolls([]);
      setVotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: p, error } = await db
      .from("community_polls")
      .select("*")
      .eq("program_id", programId)
      .order("created_at", { ascending: false });
    if (error) {
      setPolls([]);
      setVotes([]);
      setLoading(false);
      return;
    }
    const list = (p as Poll[]) || [];
    setPolls(list);
    if (list.length > 0) {
      const { data: v } = await db
        .from("community_poll_votes")
        .select("poll_id, user_id, option_index")
        .in("poll_id", list.map((x) => x.id));
      setVotes((v as Vote[]) || []);
    } else {
      setVotes([]);
    }
    setLoading(false);
  }, [programId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const countsFor = useCallback(
    (poll: Poll) =>
      poll.options.map((_, i) =>
        votes.filter((v) => v.poll_id === poll.id && v.option_index === i).length
      ),
    [votes]
  );

  const myVoteFor = useCallback(
    (pollId: string) =>
      votes.find((v) => v.poll_id === pollId && v.user_id === userId)?.option_index ?? null,
    [votes, userId]
  );

  const vote = useCallback(
    async (pollId: string, optionIndex: number) => {
      const { error } = await db
        .from("community_poll_votes")
        .insert({ poll_id: pollId, option_index: optionIndex });
      if (error) toast.error("No se pudo registrar tu voto");
      else {
        toast.success("Voto registrado");
        refresh();
      }
    },
    [refresh]
  );

  const create = useCallback(
    async (question: string, options: string[]) => {
      if (!programId) return false;
      const { error } = await db
        .from("community_polls")
        .insert({ program_id: programId, question, options });
      if (error) {
        toast.error(
          error.message?.includes("community_polls")
            ? "Falta crear las tablas de encuestas en la base de datos"
            : error.message
        );
        return false;
      }
      toast.success("Encuesta publicada");
      refresh();
      return true;
    },
    [programId, refresh]
  );

  const setStatus = useCallback(
    async (pollId: string, status: "open" | "closed") => {
      const { error } = await db.from("community_polls").update({ status }).eq("id", pollId);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (pollId: string) => {
      const { error } = await db.from("community_polls").delete().eq("id", pollId);
      if (error) toast.error(error.message);
      else refresh();
    },
    [refresh]
  );

  return { polls, loading, countsFor, myVoteFor, vote, create, setStatus, remove, refresh };
}
