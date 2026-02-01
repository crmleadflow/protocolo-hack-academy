import React from "react";
import { ArrowRight, CheckCircle, Crown, Package, Sparkles } from "lucide-react";

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
    <HolographicCard
      variant="glow"
      hover={false}
      className={cn("relative overflow-hidden p-4 md:p-6", className)}
    >
      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-border/50 text-xs font-bold">
            <Crown className="w-4 h-4 text-primary" />
            RECOMENDADO
            <Sparkles className="w-4 h-4 text-secondary" />
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
            <Package className="w-4 h-4" />
            Pack completo
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-lg sm:text-2xl leading-tight">
              <span className="text-gradient neon-text">Arsenal Maestro: Hack 6</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Activa los 6 programas + 2 bonos de IA en un solo acceso.
            </p>

            <ul className="mt-3 grid gap-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                <span>
                  Incluye Protocolo Hack, Neuro Talk, IA Business Lab, Product Creator Pro, Fast Brand Accelerator y
                  Video Magnet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-secondary" />
                <span>+ Mentor IA y Neuro Scanner (bonos incluidos).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span>Acceso inmediato al completar tu compra.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="text-xs text-muted-foreground">Hoy por</div>
            <div className="text-3xl sm:text-4xl font-heading font-bold text-primary">$499 USD</div>

            {onCtaClick && (
              <NeonButton size="lg" onClick={onCtaClick} className="w-full lg:w-auto whitespace-normal">
                <span className="text-center">Ver Arsenal Maestro</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </NeonButton>
            )}
          </div>
        </div>
      </div>
    </HolographicCard>
  );
};
