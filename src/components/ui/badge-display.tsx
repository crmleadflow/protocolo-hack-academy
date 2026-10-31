import React from "react";
import { cn } from "@/lib/utils";
import { Award, Star, Zap, Trophy, Target, Flame } from "lucide-react";
import { DemoBadge } from "@/data/demo-data";

export type BadgeType = "streak" | "completion" | "achievement" | "level" | "special" | "xp";

interface BadgeDisplayProps {
  badge?: DemoBadge;
  type?: BadgeType;
  label?: string;
  value?: string | number;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeConfig = {
  streak: { icon: Flame, color: "from-orange-500 to-red-500", glow: "shadow-orange-500/50" },
  completion: { icon: Trophy, color: "from-yellow-500 to-amber-500", glow: "shadow-yellow-500/50" },
  achievement: { icon: Award, color: "from-purple-500 to-pink-500", glow: "shadow-purple-500/50" },
  level: { icon: Star, color: "from-cyan-500 to-blue-500", glow: "shadow-cyan-500/50" },
  special: { icon: Zap, color: "from-green-500 to-emerald-500", glow: "shadow-green-500/50" },
  xp: { icon: Target, color: "from-blue-500 to-indigo-500", glow: "shadow-blue-500/50" },
};

const sizeConfig = {
  sm: { container: "w-12 h-12", icon: "w-5 h-5", text: "text-xs" },
  md: { container: "w-16 h-16", icon: "w-7 h-7", text: "text-sm" },
  lg: { container: "w-20 h-20", icon: "w-9 h-9", text: "text-base" },
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  type: propType,
  label: propLabel,
  value: propValue,
  unlocked: propUnlocked = true,
  size = "md",
  className,
}) => {
  // Use badge object if provided, otherwise use individual props
  const type = badge?.type || propType || "achievement";
  const label = badge?.label || propLabel || "";
  const value = badge?.value || propValue;
  const unlocked = badge?.unlocked ?? propUnlocked;

  const config = badgeConfig[type];
  const sizeClass = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all duration-300",
          sizeClass.container,
          unlocked
            ? `bg-gradient-to-br ${config.color} shadow-lg ${config.glow}`
            : "bg-muted/50 grayscale"
        )}
      >
        <Icon className={cn(sizeClass.icon, unlocked ? "text-white" : "text-muted-foreground")} />
        {value && unlocked && (
          <div className="absolute -top-1 -right-1 bg-background border border-border rounded-full px-1.5 py-0.5 text-xs font-bold">
            {value}
          </div>
        )}
      </div>
      <span className={cn(sizeClass.text, "text-center font-medium", unlocked ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
};

export { BadgeDisplay };
