import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePolls } from "@/hooks/useCommunityPolls";

interface Props {
  programId: string;
  userId?: string;
}

export const PollsSection: React.FC<Props> = ({ programId, userId }) => {
  const { polls, countsFor, myVoteFor, vote } = usePolls(programId, userId);
  const open = polls.filter((p) => p.status === "open");
  if (open.length === 0) return null;

  return (
    <div className="space-y-4">
      {open.map((poll) => {
        const counts = countsFor(poll);
        const total = counts.reduce((a, b) => a + b, 0);
        const mine = myVoteFor(poll.id);
        return (
          <div key={poll.id} className="rounded-[2rem] bg-secondary p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Encuesta</p>
                <h3 className="font-heading text-lg font-semibold">{poll.question}</h3>
              </div>
            </div>
            <div className="space-y-2">
              {poll.options.map((opt, i) => {
                const pct = total ? Math.round((counts[i] / total) * 100) : 0;
                return mine === null ? (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start rounded-full"
                    onClick={() => vote(poll.id, i)}
                  >
                    {opt}
                  </Button>
                ) : (
                  <div key={i} className="relative overflow-hidden rounded-full border border-border bg-background">
                    <div
                      className={cn("absolute inset-y-0 left-0", mine === i ? "bg-primary/30" : "bg-muted")}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex justify-between px-4 py-2 text-sm">
                      <span>{opt}</span>
                      <span className="text-muted-foreground">
                        {pct}% · {counts[i]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{total} votos</p>
          </div>
        );
      })}
    </div>
  );
};
