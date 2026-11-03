import React, { useState } from "react";
import { MessageSquare, HelpCircle, Target, Briefcase, BarChart3, ExternalLink, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/hooks/useCommunity";
import { useChallenges, useOpportunities } from "@/hooks/useCommunityModules";
import { usePolls } from "@/hooks/useCommunityPolls";

export const CARD_KINDS = ["discussion", "question", "challenge", "opportunity", "poll"];

export interface CardContext {
  userId?: string;
  onOpenPost: (postId: string) => void;
  challenges: ReturnType<typeof useChallenges>;
  opportunities: ReturnType<typeof useOpportunities>;
  polls: ReturnType<typeof usePolls>;
}

const META: Record<string, { label: string; icon: React.ElementType }> = {
  discussion: { label: "Discusión", icon: MessageSquare },
  question: { label: "Pregunta", icon: HelpCircle },
  challenge: { label: "Reto", icon: Target },
  opportunity: { label: "Oportunidad", icon: Briefcase },
  poll: { label: "Encuesta", icon: BarChart3 },
};

const Shell: React.FC<{ kind: string; title: string; children?: React.ReactNode }> = ({ kind, title, children }) => {
  const { label, icon: Icon } = META[kind];
  return (
    <div className="w-full min-w-[240px] max-w-md space-y-3 rounded-2xl border border-primary/30 bg-background/70 p-4 text-left">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <h4 className="font-heading text-base font-semibold">{title}</h4>
      {children}
    </div>
  );
};

const ChallengeBody: React.FC<{ id: string; ctx: CardContext }> = ({ id, ctx }) => {
  const { challenges, myPartFor, join, submit } = ctx.challenges;
  const [text, setText] = useState("");
  const ch = challenges.find((c) => c.id === id);
  if (!ch) return <p className="text-sm text-muted-foreground">Este reto ya no está disponible.</p>;
  const part = myPartFor(id);
  return (
    <>
      {ch.description && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{ch.description}</p>}
      <p className="text-xs text-muted-foreground">
        {ch.xp_reward} pts{ch.due_date ? ` · hasta ${new Date(ch.due_date).toLocaleDateString("es-CO")}` : ""}
        {ch.status === "closed" ? " · Cerrado" : ""}
      </p>
      {ch.status === "open" && !part && (
        <Button size="sm" className="rounded-full" onClick={() => join(id)}>Unirme al reto</Button>
      )}
      {ch.status === "open" && part?.status === "joined" && (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu entrega o pega el enlace" className="min-h-[70px]" />
          <Button size="sm" className="rounded-full" disabled={!text.trim()} onClick={() => submit(id, text.trim()).then(() => setText(""))}>
            Entregar
          </Button>
        </div>
      )}
      {part?.status === "submitted" && <p className="text-sm text-primary">Entregado. El equipo lo está revisando.</p>}
      {part?.status === "completed" && <p className="text-sm text-green-600">Completado. ¡Ganaste los puntos!</p>}
    </>
  );
};

const OpportunityBody: React.FC<{ id: string; ctx: CardContext }> = ({ id, ctx }) => {
  const { items, myResponse, respond } = ctx.opportunities;
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const op = items.find((o) => o.id === id);
  if (!op) return <p className="text-sm text-muted-foreground">Esta oportunidad ya no está disponible.</p>;
  const mine = ctx.userId ? myResponse(id, ctx.userId) : undefined;
  return (
    <>
      {op.description && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{op.description}</p>}
      <div className="flex flex-wrap gap-3 text-xs">
        {op.link && (
          <a href={op.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">
            <ExternalLink className="h-3 w-3" /> Ver enlace
          </a>
        )}
        {op.contact_email && (
          <a href={`mailto:${op.contact_email}`} className="inline-flex items-center gap-1 text-primary underline">
            <Mail className="h-3 w-3" /> {op.contact_email}
          </a>
        )}
      </div>
      {op.status === "closed" ? (
        <p className="text-xs text-muted-foreground">Cerrada</p>
      ) : mine ? (
        <p className="text-sm text-green-600">Ya enviaste tu interés.</p>
      ) : open ? (
        <div className="space-y-2">
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Cuéntales por qué te interesa" className="min-h-[70px]" />
          <Button size="sm" className="rounded-full" disabled={!msg.trim() || !ctx.userId} onClick={() => ctx.userId && respond(id, ctx.userId, msg.trim()).then(() => setOpen(false))}>
            Enviar
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpen(true)}>Me interesa</Button>
      )}
    </>
  );
};

const PollBody: React.FC<{ id: string; ctx: CardContext }> = ({ id, ctx }) => {
  const { polls, countsFor, myVoteFor, vote } = ctx.polls;
  const poll = polls.find((p) => p.id === id);
  if (!poll) return <p className="text-sm text-muted-foreground">Esta encuesta ya no está disponible.</p>;
  const counts = countsFor(poll);
  const total = counts.reduce((a, b) => a + b, 0);
  const mine = myVoteFor(id);
  const showResults = mine !== null || poll.status === "closed";
  return (
    <div className="space-y-2">
      {poll.options.map((opt, i) => {
        const pct = total ? Math.round((counts[i] / total) * 100) : 0;
        return showResults ? (
          <div key={i} className="relative overflow-hidden rounded-full border border-border bg-background">
            <div className={cn("absolute inset-y-0 left-0", mine === i ? "bg-primary/30" : "bg-muted")} style={{ width: `${pct}%` }} />
            <div className="relative flex justify-between px-4 py-2 text-sm">
              <span>{opt}</span>
              <span className="text-muted-foreground">{pct}% · {counts[i]}</span>
            </div>
          </div>
        ) : (
          <Button key={i} variant="outline" className="w-full justify-start rounded-full" onClick={() => vote(id, i)}>
            {opt}
          </Button>
        );
      })}
      <p className="text-xs text-muted-foreground">{total} votos{poll.status === "closed" ? " · Cerrada" : ""}</p>
    </div>
  );
};

export const ChatCard: React.FC<{ message: ChatMessage; ctx: CardContext }> = ({ message, ctx }) => {
  const kind = message.kind as string;
  const id = message.ref_id as string;
  return (
    <Shell kind={kind} title={message.content}>
      {(kind === "discussion" || kind === "question") && (
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => ctx.onOpenPost(id)}>
          Abrir y comentar
        </Button>
      )}
      {kind === "challenge" && <ChallengeBody id={id} ctx={ctx} />}
      {kind === "opportunity" && <OpportunityBody id={id} ctx={ctx} />}
      {kind === "poll" && <PollBody id={id} ctx={ctx} />}
    </Shell>
  );
};
