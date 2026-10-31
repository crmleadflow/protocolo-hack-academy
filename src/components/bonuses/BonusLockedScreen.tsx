import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, Brain, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ARSENAL_MAESTRO_HACK6_ID } from "@/hooks/useBonusAccess";

interface BonusLockedScreenProps {
  bonusType: "mentor" | "neuro-scanner";
}

export function BonusLockedScreen({ bonusType }: BonusLockedScreenProps) {
  const navigate = useNavigate();

  const isMentor = bonusType === "mentor";
  const Icon = isMentor ? Sparkles : Brain;
  const title = isMentor ? "Mi Mentor IA" : "Neuro Analyzer Pro";
  const subtitle = isMentor ? null : "Analizador de Neuro-Oratoria";
  const description = isMentor
    ? "Tu mentor virtual 24/7 entrenado con todo el conocimiento de los programas."
    : "Analiza tu discurso de venta con IA. Mejora tu capacidad de cierre y persuasión.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="glass-card max-w-lg w-full border-primary/30">
        <CardContent className="p-8 text-center space-y-6">
          {/* Lock Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-heading font-bold text-gradient">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-sm text-primary/80 font-medium">{subtitle}</p>
            )}
            <p className="text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Bonus Badge */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-secondary">Bono Exclusivo</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Esta herramienta está disponible como <strong>bono exclusivo</strong> para los miembros del paquete <strong>"Arsenal Maestro: Hack 6"</strong>.
            </p>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-lg font-bold text-gradient">
                6 Programas + 2 Bonos
              </p>
              <p className="text-2xl font-heading font-bold text-primary mt-1">
                $499 USD
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Valor total: $3,486 USD
              </p>
            </div>
          </div>

          {/* Included Bonuses */}
          <div className="flex justify-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isMentor ? "bg-primary/20 border border-primary/30" : "bg-muted/50"}`}>
              <Sparkles className={`w-4 h-4 ${isMentor ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${isMentor ? "text-primary font-medium" : "text-muted-foreground"}`}>Mi Mentor IA</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${!isMentor ? "bg-secondary/20 border border-secondary/30" : "bg-muted/50"}`}>
              <Brain className={`w-4 h-4 ${!isMentor ? "text-secondary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${!isMentor ? "text-secondary font-medium" : "text-muted-foreground"}`}>Neuro Analyzer Pro</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate(`/checkout/${ARSENAL_MAESTRO_HACK6_ID}`)}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6"
            size="lg"
          >
            Desbloquear Acceso Completo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Back Link */}
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
