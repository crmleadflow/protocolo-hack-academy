import React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "secondary" | "accent";
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  color = "primary",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary",
    secondary: "stroke-secondary",
    accent: "stroke-accent",
  };

  const glowColors = {
    primary: "drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)]",
    secondary: "drop-shadow-[0_0_10px_hsl(var(--secondary)/0.8)]",
    accent: "drop-shadow-[0_0_10px_hsl(var(--accent)/0.8)]",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className={cn("transform -rotate-90", glowColors[color])}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn(colorClasses[color], "transition-all duration-500 ease-out")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-heading font-bold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export { ProgressRing };
