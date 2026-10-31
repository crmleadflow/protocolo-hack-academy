import * as React from "react";
import { cn } from "@/lib/utils";

interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "gradient";
  hover?: boolean;
}

const HolographicCard = React.forwardRef<HTMLDivElement, HolographicCardProps>(
  ({ className, variant = "default", hover = true, children, ...props }, ref) => {
    const variants = {
      default: "glass",
      glow: "glass neon-glow",
      gradient: "glass holographic-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl p-6 transition-shadow",
          variants[variant],
          hover && "hover-lift cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
HolographicCard.displayName = "HolographicCard";

const HolographicCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
HolographicCardHeader.displayName = "HolographicCardHeader";

const HolographicCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-heading font-semibold tracking-wide", className)}
    {...props}
  />
));
HolographicCardTitle.displayName = "HolographicCardTitle";

const HolographicCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
HolographicCardDescription.displayName = "HolographicCardDescription";

const HolographicCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
HolographicCardContent.displayName = "HolographicCardContent";

const HolographicCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
HolographicCardFooter.displayName = "HolographicCardFooter";

export {
  HolographicCard,
  HolographicCardHeader,
  HolographicCardTitle,
  HolographicCardDescription,
  HolographicCardContent,
  HolographicCardFooter,
};
