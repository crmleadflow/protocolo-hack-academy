import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-heading font-medium tracking-wider uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow hover:shadow-[0_0_30px_hsl(var(--primary)/0.6),0_0_60px_hsl(var(--primary)/0.4)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 neon-glow-purple hover:shadow-[0_0_30px_hsl(var(--secondary)/0.6),0_0_60px_hsl(var(--secondary)/0.4)]",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-primary",
        gradient:
          "bg-gradient-holographic text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        xl: "h-16 px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean;
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(neonButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeonButton.displayName = "NeonButton";

export { NeonButton, neonButtonVariants };
