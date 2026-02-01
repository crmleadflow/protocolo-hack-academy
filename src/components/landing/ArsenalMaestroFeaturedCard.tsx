import React from "react";
import { ArrowRight, CheckCircle, Crown, Package, Sparkles, Flame, Zap } from "lucide-react";

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
        className="relative overflow-hidden p-3 sm:p-4 md:p-6 border-2 border-primary/50"
      >
        {/* Animated corner accents - hidden on mobile */}
        <div className="absolute top-0 left-0 w-12 md:w-16 h-12 md:h-16 border-t-2 border-l-2 border-primary rounded-tl-xl hidden sm:block" />
        <div className="absolute bottom-0 right-0 w-12 md:w-16 h-12 md:h-16 border-b-2 border-r-2 border-secondary rounded-br-xl hidden sm:block" />
        
        {/* Ambient glow effects */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Sparkle decoration - hidden on mobile */}
        <Sparkles className="absolute top-4 left-4 w-5 h-5 text-primary/60 animate-pulse hidden md:block" />

        {/* Badges - Desktop: Top Right Corner / Mobile: Below banner */}
        <div className="hidden sm:flex absolute top-3 right-3 flex-col items-end gap-1.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30 animate-pulse">
            <Crown className="w-4 h-4" />
            RECOMENDADO
            <Flame className="w-4 h-4" />
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full glass border border-primary/30 text-[10px] text-foreground font-medium">
            <Package className="w-3.5 h-3.5 text-primary" />
            Pack completo
          </span>
        </div>

        {/* "BEST VALUE" ribbon effect - Hidden on mobile, shown on sm+ */}
        <div className="absolute -left-12 top-5 rotate-[-45deg] bg-gradient-to-r from-secondary to-primary px-14 py-1.5 text-[9px] md:text-[10px] font-bold text-primary-foreground shadow-lg z-20 tracking-wide hidden sm:flex items-center justify-center whitespace-nowrap">
          MEJOR PRECIO
        </div>

        {/* Mobile-only: horizontal banner + badges in same row */}
        <div className="sm:hidden flex flex-col w-full -mt-3 -mx-3 mb-3" style={{ width: 'calc(100% + 1.5rem)' }}>
          {/* Banner */}
          <div className="w-full bg-gradient-to-r from-secondary to-primary py-1.5 px-3 flex items-center justify-center gap-2 rounded-t-lg">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground tracking-wide">MEJOR PRECIO • AHORRAS 87%</span>
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </div>
          {/* Badges row below banner */}
          <div className="flex items-center justify-center gap-2 py-1.5 bg-background/50 backdrop-blur-sm">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-[9px] font-bold shadow-md">
              <Crown className="w-2.5 h-2.5" />
              TOP
              <Flame className="w-2.5 h-2.5" />
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full glass border border-primary/30 text-[9px] text-foreground font-medium">
              <Package className="w-2.5 h-2.5 text-primary" />
              Pack completo
            </span>
          </div>
        </div>

        <div className="relative pt-2 sm:pt-6 md:pt-4 sm:pl-10 md:pl-8">
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              {/* Title with icon */}
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
                <h3 className="font-heading font-bold text-lg sm:text-xl md:text-3xl leading-tight text-foreground">
                  Arsenal Maestro: Hack 6
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                Activa los <span className="text-primary font-semibold">6 programas</span> + <span className="text-secondary font-semibold">2 bonos de IA</span> en un solo acceso.
              </p>

              <ul className="mt-3 sm:mt-4 grid gap-2 text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>
                    Incluye <span className="text-foreground font-medium">Protocolo Hack, Neuro Talk, IA Business Lab, Product Creator Pro, Fast Brand Accelerator y Video Magnet</span>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 text-secondary flex-shrink-0" />
                  <span>+ <span className="text-secondary font-medium">Mentor IA y Neuro Scanner</span> (bonos incluidos).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Acceso <span className="text-primary font-medium">inmediato</span> al completar tu compra.</span>
                </li>
              </ul>
            </div>

            {/* Price and CTA - Full width on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pt-2 border-t border-border/30">
              {/* Price comparison */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground line-through">$3,886 USD</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    AHORRAS $3,387
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xs text-secondary font-medium">Hoy:</span>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-primary">
                    $499
                  </span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
              </div>

              {onCtaClick && (
                <NeonButton size="lg" onClick={onCtaClick} className="w-full sm:w-auto whitespace-normal group">
                  <span className="text-center text-sm sm:text-base">¡ACTIVAR ARSENAL!</span>
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
