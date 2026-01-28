import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-base text-foreground ring-offset-background transition-all duration-300",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary/50",
            "focus-visible:shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
            "hover:border-white/20 hover:bg-white/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
GlassInput.displayName = "GlassInput";

export { GlassInput };
