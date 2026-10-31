import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: "progress" | "social" | "milestone";
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  onClick?: () => void;
}

const categoryColors = {
  progress: {
    bg: "from-primary/20 to-cyan-500/20",
    border: "border-primary/50",
    glow: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
    icon: "text-primary",
  },
  social: {
    bg: "from-secondary/20 to-pink-500/20",
    border: "border-secondary/50",
    glow: "shadow-[0_0_20px_hsl(var(--secondary)/0.3)]",
    icon: "text-secondary",
  },
  milestone: {
    bg: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/50",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    icon: "text-amber-400",
  },
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  xpReward,
  category,
  isUnlocked,
  unlockedAt,
  progress,
  onClick,
}) => {
  // Dynamically get icon from Lucide
  const getIconComponent = (iconName: string) => {
    const formattedName = iconName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    return (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[formattedName] || LucideIcons.Trophy;
  };
  
  const IconComponent = getIconComponent(icon);

  const colors = categoryColors[category];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        "rounded-xl p-4 border backdrop-blur-sm",
        isUnlocked
          ? `bg-gradient-to-br ${colors.bg} ${colors.border} ${colors.glow}`
          : "bg-muted/20 border-muted/30 grayscale",
        isUnlocked && "hover:scale-105"
      )}
    >
      {/* Badge icon */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-background to-muted/50",
            "border-2 transition-all duration-300",
            isUnlocked ? colors.border : "border-muted/30"
          )}
        >
          <IconComponent
            className={cn(
              "w-8 h-8 transition-all",
              isUnlocked ? colors.icon : "text-muted-foreground/50"
            )}
          />
        </div>

        <div className="space-y-1">
          <h4
            className={cn(
              "font-heading font-semibold text-sm",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* XP reward */}
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isUnlocked ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LucideIcons.Zap className="w-3 h-3" />
          <span>+{xpReward} XP</span>
        </div>

        {/* Progress bar (only for locked achievements) */}
        {!isUnlocked && progress > 0 && (
          <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Unlocked date */}
        {isUnlocked && unlockedAt && (
          <p className="text-[10px] text-muted-foreground">
            {new Date(unlockedAt).toLocaleDateString("es-ES")}
          </p>
        )}
      </div>

      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 backdrop-blur-[1px]">
          <LucideIcons.Lock className="w-6 h-6 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
};
