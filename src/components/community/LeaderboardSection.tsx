import React from "react";
import { Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLeaderboard, levelName } from "@/hooks/useCommunityModules";

interface Props {
  programId: string;
  userId?: string;
}

export const LeaderboardSection: React.FC<Props> = ({ programId, userId }) => {
  const { rows, mine, loading } = useLeaderboard(programId);

  const myRank = userId ? rows.findIndex((r) => r.user_id === userId) + 1 : 0;

  return (
    <div className="space-y-6">
      <div className="dark-island rounded-[2rem] px-6 py-4">
        <p className="display text-xl md:text-2xl">
          Ranking <span className="serif-accent text-primary normal-case">del curso</span>
        </p>
        <p className="text-xs uppercase tracking-widest opacity-70 mt-1">
          Puntos por lecciones, retos y participación
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[2rem] bg-secondary p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[2rem] bg-secondary p-10 text-center">
          <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-heading font-semibold mb-1">Ranking en cero</h3>
          <p className="text-sm text-muted-foreground">
            Nadie ha sumado puntos todavía en este curso. Completa lecciones o retos para
            aparecer aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={r.user_id}
                className={`rounded-[2rem] p-4 flex items-center gap-4 ${
                  r.user_id === userId ? "dark-island" : "bg-secondary"
                }`}
              >
                <span className="display text-2xl w-10 text-center opacity-70">{i + 1}</span>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={r.avatar_url || ""} />
                  <AvatarFallback>{r.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold truncate uppercase">{r.full_name}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {levelName(r.total_xp)}
                  </p>
                </div>
                <p className="display text-xl text-right">
                  {r.total_xp}
                  <span className="text-xs uppercase tracking-widest block opacity-60">pts</span>
                </p>
              </div>
            ))}
          </div>

          {userId && myRank === 0 && mine && (
            <div className="rounded-[2rem] bg-secondary p-5 text-center">
              <p className="text-sm">
                Aún no apareces en el top 20 de este curso. Llevas{" "}
                <span className="font-semibold">{mine.total_xp} puntos</span>.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
