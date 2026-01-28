import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent";
  trend?: "up" | "down";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  trend,
  className,
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div
      className={cn(
        "glass rounded-xl p-5 hover-lift",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-heading font-bold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {trend === "up" && <span className="text-green-400">↑</span>}
              {trend === "down" && <span className="text-red-400">↓</span>}
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export { StatCard };
