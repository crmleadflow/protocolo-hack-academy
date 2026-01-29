import React from "react";
import { Zap, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelProgressCardProps {
  totalXP: number;
  level: number;
  levelName: string;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progressToNext: number;
  nextLevelName: string | null;
  streak: number;
  longestStreak: number;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  totalXP,
  level,
  levelName,
  xpInCurrentLevel,
  xpNeededForNext,
  progressToNext,
  nextLevelName,
  streak,
  longestStreak,
}) => {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Level badge */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center neon-glow">
              <div className="w-20 h-20 rounded-full bg-background flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-bold text-gradient">
                  {level}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Nivel
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-heading font-bold text-gradient">
              {levelName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalXP.toLocaleString()} XP total
            </p>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso al siguiente nivel</span>
            {nextLevelName && (
              <span className="font-medium text-primary">
                {xpInCurrentLevel} / {xpNeededForNext} XP
              </span>
            )}
          </div>

          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${progressToNext}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>

          {nextLevelName ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Siguiente: <span className="text-foreground font-medium">{nextLevelName}</span>
            </p>
          ) : (
            <p className="text-xs text-primary flex items-center gap-1">
              <Target className="w-3 h-3" />
              ¡Has alcanzado el nivel máximo!
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex lg:flex-col gap-4 lg:gap-2 lg:border-l lg:border-border/50 lg:pl-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <div>
              <p className="text-lg font-heading font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Racha actual</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <div>
              <p className="text-lg font-heading font-bold">{longestStreak}</p>
              <p className="text-[10px] text-muted-foreground">Mejor racha</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
