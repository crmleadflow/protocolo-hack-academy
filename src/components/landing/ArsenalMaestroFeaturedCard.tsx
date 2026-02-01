import React from "react";
import { ArrowRight, CheckCircle, Crown, Package, Sparkles, Star, Flame, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";

interface ArsenalMaestroFeaturedCardProps {
  className?: string;
  onCtaClick?: () => void;
}

export const ArsenalMaestroFeaturedCard: React.FC<ArsenalMaestroFeaturedCardProps> = ({
  className,
  onCtaClick,
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Outer premium glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-lg opacity-75 animate-pulse" />
      
      <HolographicCard
        variant="glow"
        hover={false}
        className="relative overflow-hidden p-4 md:p-6 border-2 border-primary/50"
      >
        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary rounded-tl-xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-secondary rounded-br-xl" />
        
        {/* Ambient glow effects */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Sparkle decorations */}
        <Sparkles className="absolute top-4 left-4 w-5 h-5 text-primary/60 animate-pulse" />
        <Star className="absolute bottom-4 right-20 w-4 h-4 text-secondary/60 animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Badges - Top Right Corner */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30 animate-pulse">
            <Crown className="w-4 h-4" />
            RECOMENDADO
            <Flame className="w-4 h-4" />
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-primary/30 text-[10px] text-foreground font-medium">
            <Package className="w-3.5 h-3.5 text-primary" />
            Pack completo
          </span>
        </div>

        {/* "BEST VALUE" ribbon effect */}
        <div className="absolute -left-10 top-4 rotate-[-45deg] bg-gradient-to-r from-secondary to-primary px-12 py-1 text-[10px] font-bold text-primary-foreground shadow-lg z-20">
          MEJOR PRECIO
        </div>

        <div className="relative pt-2 md:pt-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="min-w-0 pr-4 md:pr-0 pl-8 md:pl-0">
              {/* Title with icon */}
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary animate-pulse hidden md:block" />
                <h3 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl leading-tight text-foreground">
                  Arsenal Maestro: Hack 6
                </h3>
              </div>
              
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Activa los <span className="text-primary font-semibold">6 programas</span> + <span className="text-secondary font-semibold">2 bonos de IA</span> en un solo acceso.
              </p>

              <ul className="mt-4 grid gap-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>
                    Incluye <span className="text-foreground font-medium">Protocolo Hack, Neuro Talk, IA Business Lab, Product Creator Pro, Fast Brand Accelerator y Video Magnet</span>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                  <span>+ <span className="text-secondary font-medium">Mentor IA y Neuro Scanner</span> (bonos incluidos).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Acceso <span className="text-primary font-medium">inmediato</span> al completar tu compra.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[180px]">
              {/* Price comparison */}
              <div className="flex flex-col items-start lg:items-end">
                <div className="text-xs text-muted-foreground line-through">Valor real: $3,886 USD</div>
                <div className="text-xs text-secondary font-medium">Hoy por solo</div>
                <div className="text-4xl sm:text-5xl font-heading font-bold text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                  $499
                  <span className="text-lg ml-1">USD</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  AHORRAS $3,387
                </div>
              </div>

              {onCtaClick && (
                <NeonButton size="lg" onClick={onCtaClick} className="w-full lg:w-auto whitespace-normal group">
                  <span className="text-center">¡ACTIVAR ARSENAL!</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </NeonButton>
              )}
            </div>
          </div>
        </div>
      </HolographicCard>
    </div>
  );
};
