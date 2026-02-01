import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, Sparkles, ArrowRight, Quote, Star,
  Zap, Target, Mic, Bot, Video, Crown, Package, UserCheck, Rocket, Globe, TrendingUp, Users, BookOpen, Loader2, Volume2, VolumeX, Play, Shield, Brain, Magnet, Factory, Briefcase, CheckCircle, HelpCircle
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { HolographicCard } from "@/components/ui/holographic-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import hectorVideo from "@/assets/protocolo_1.mp4";

// Program thumbnails for pillars
import iaBusinessLabThumb from "@/assets/ia-business-lab-thumbnail.png";
import neuroTalkThumb from "@/assets/neuro-talk-thumbnail.jpg";
import fastBrandThumb from "@/assets/fast-brand-accelerator-thumbnail.png";
import protocoloHackThumb from "@/assets/protocolo-hack-thumbnail.png";

import videoMagnetThumb from "@/assets/video-magnet-thumbnail.png";
import productCreatorThumb from "@/assets/product-creator-pro-thumbnail.png";
import warrantyBadge from "@/assets/warranty-badge.jpg";

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({
  end,
  duration = 2000,
  suffix = "",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// 7 Pillars data with thumbnails
// Los 6 Motores del Arsenal
const arsenalMotors = [
  {
    number: 1,
    thumbnail: protocoloHackThumb,
    title: "Protocolo Hack",
    adn: "Software Mental de Abundancia",
    description: "El manual definitivo para reprogramar tu mente, borrar miedos y eliminar bloqueos de escasez. Instalamos en ti el sistema operativo de un líder de élite para atraer resultados millonarios por diseño, no por suerte.",
    price: null,
  },
  {
    number: 2,
    thumbnail: neuroTalkThumb,
    title: "Neuro Talk",
    adn: "El Mensaje que obliga al 'SÍ'",
    description: "Aprende a llegar directamente al cerebro de tus clientes para que tomen una decisión de compra rápida. Sabrás cómo enviar el mensaje correcto para vender, hackeando el proceso de decisión para que el 'SÍ' sea inevitable.",
    price: "$999 USD",
  },
  {
    number: 3,
    thumbnail: iaBusinessLabThumb,
    title: "IA Business Lab",
    adn: "Automatización Total",
    description: "Domina la Inteligencia Artificial para automatizar y facilitar procesos: creación de anuncios, guiones, landing pages, embudos y agentes de IA que atienden clientes 24/7. Tú eres el Arquitecto, la IA es tu constructora.",
    price: "$599 USD",
  },
  {
    number: 4,
    thumbnail: fastBrandThumb,
    title: "Fast Brand Accelerator",
    adn: "Autoridad a Máxima Velocidad",
    description: "Escala y potencializa tu marca personal con las estrategias correctas. Usa la IA para producir y editar tu contenido; haz que la tecnología lo haga por ti y deja de ser un esclavo de las redes sociales.",
    price: null,
  },
  {
    number: 5,
    thumbnail: videoMagnetThumb,
    title: "Video Magnet",
    adn: "Atracción Magnética",
    description: "Convierte tus videos en un imán de clientes. Aprende a crear contenido visual que detenga el scroll y atraiga prospectos calificados en automático, posicionándote como la única opción en el mercado.",
    price: null,
  },
  {
    number: 6,
    thumbnail: productCreatorThumb,
    title: "Product Creator Pro",
    adn: "Fábrica de Activos",
    description: "Transforma tu experiencia en productos digitales (e-books, cursos, mentorías) que se vendan solos. Convierte tu conocimiento en una fuente de ingresos pasivos que no dependa de tu tiempo.",
    price: null,
  },
];

// Bonos de IA
const aiBonuses = [
  {
    title: "Mi Mentor IA",
    subtitle: "Acceso 24/7 a mi Cerebro",
    description: "He entrenado a un Agente de IA con mis 25 años de trayectoria. Te responderá dudas, te dará estrategias y te guiará como si yo estuviera presente en tu oficina en cada paso que des.",
    icon: Bot,
    value: "$150 USD",
  },
  {
    title: "Neuro Analyzer Pro",
    subtitle: "Analizador de Neuro-Oratoria",
    description: "Sube tus discursos, tus guiones o tus copys. Este Agente especializado analizará tu redacción y te dirá exactamente qué corregir y cómo mejorarla para que sea imposible que te digan que no.",
    icon: Mic,
    value: "$150 USD",
  },
];

// Stack de la oferta
const offerStack = [
  { title: "Neuro Talk", price: "$999 USD", isPremium: true },
  { title: "IA Business Lab", price: "$599 USD", isPremium: true },
  { title: "Protocolo Hack", price: "$497 USD", isPremium: false },
  { title: "Fast Brand Accelerator", price: "$497 USD", isPremium: false },
  { title: "Video Magnet", price: "$497 USD", isPremium: false },
  { title: "Product Creator Pro", price: "$497 USD", isPremium: false },
  { title: "BONO: Neuro Analyzer Pro", price: "$150 USD", isBonus: true },
  { title: "BONO: Mi Mentor IA", price: "$150 USD", isBonus: true },
];

// Mentor credentials
const credentials = [
  {
    icon: Globe,
    title: "25+ años de resultados",
    description: "Comprobados en negocios y Network Marketing",
  },
  {
    icon: Users,
    title: "380,000+ personas",
    description: "Comunidades en 94 países",
  },
  {
    icon: TrendingUp,
    title: "Top Earner x7",
    description: "En 7 compañías diferentes",
  },
  {
    icon: Bot,
    title: "Lead Navigator",
    description: "Creador de herramientas de automatización",
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [videoProgress, setVideoProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progress = (current / duration) * 100;
      setVideoProgress(progress);
      setMaxProgress(prev => Math.max(prev, progress));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && videoDuration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickProgress = (clickX / width) * 100;
      
      if (clickProgress <= maxProgress) {
        const newTime = (clickProgress / 100) * videoDuration;
        videoRef.current.currentTime = newTime;
        setVideoProgress(clickProgress);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground particleCount={40} />
      <Header transparent />

      {/* SECCIÓN 1: EL FILTRO DE ÉLITE (Pre-Headline) */}
      <section className="relative pt-20 md:pt-24 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-xl p-4 md:p-6 text-center border border-primary/30">
              <p className="text-sm md:text-base text-muted-foreground">
                <span className="text-primary font-semibold">¡ATENCIÓN!</span>{" "}
                <span className="text-foreground font-medium">ESTE ES EL ATAJO SECRETO:</span>{" "}
                Hecho solo para personas que ya facturan pero quieren escalar, y personas que quieren armar un negocio de éxito desde cero.{" "}
                Activa hoy el <span className="text-secondary font-semibold">'Poder de la IA'</span>: la herramienta que te quita el trabajo pesado de encima, borra tus errores y te da la llave maestra para ganar dinero en tiempo récord.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: EL DISPARADOR MAESTRO (Headline) */}
      <section className="relative flex items-center pb-6 md:pb-8">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-64 md:w-96 h-64 md:h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-6 md:mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm font-medium">El Arsenal de Ejecución Definitivo</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 md:mb-6 animate-fade-in leading-tight" style={{ animationDelay: "0.1s" }}>
              <span className="text-gradient neon-text">PROTOCOLO HACK:</span>{" "}
              <span className="text-foreground">El Código Maestro de IA y Neuro-Persuasión para Construir, Escalar y Dominar cualquier Negocio en tiempo récord.</span>
            </h1>

            {/* SECCIÓN 3: EL SUB-HEADLINE (La Promesa de Libertad) */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 px-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Ya sea que estés atrapado en la operación de tu empresa o estés lanzando tu primer activo digital:{" "}
              <span className="text-primary font-semibold">Instala el Arsenal de Ejecución</span>{" "}
              que automatiza tus ventas, crea tu marca y pone a la{" "}
              <span className="text-secondary font-semibold">Inteligencia Artificial a trabajar por ti</span> desde el primer día.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: ÁREA DE VIDEO (VSL) */}
      <section className="relative pb-10 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Video support text */}
            <p className="text-sm md:text-base text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              Mira este video ahora para descubrir cómo el <span className="text-primary font-medium">'Código Maestro'</span> de la IA y las Neuro-ventas pueden hacer el 90% del trabajo sucio por ti.
            </p>

            {/* Avatar Video */}
            <div 
              className="flex justify-center mb-6 md:mb-8 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="relative group">
                {/* Subtle glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                
                {/* Clean gradient border frame */}
                <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-primary via-secondary to-primary">
                  <div className="relative rounded-[10px] overflow-hidden bg-background/90">
                    {/* Video */}
                    <video
                      ref={videoRef}
                      src={hectorVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      className="relative z-10 max-w-[340px] sm:max-w-sm md:max-w-md w-full h-auto object-contain"
                    />
                    
                    {/* Audio toggle button */}
                    <button
                      onClick={toggleMute}
                      className="absolute top-2 right-2 z-30 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors"
                      title={isMuted ? "Activar audio" : "Silenciar"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    {/* Progress bar */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 backdrop-blur-sm cursor-pointer z-20"
                      onClick={handleProgressClick}
                    >
                      {/* Max progress indicator (what user has watched) */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-white/20"
                        style={{ width: `${maxProgress}%` }}
                      />
                      {/* Current progress */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
                        style={{ width: `${videoProgress}%` }}
                      />
                      {/* Progress handle */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${videoProgress}% - 6px)` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <NeonButton size="xl" onClick={() => navigate("/register")} className="w-full sm:w-auto text-sm md:text-base">
                ¡SÍ, QUIERO ACTIVAR EL PROTOCOLO HACK AHORA!
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </NeonButton>
            </div>

            {/* Texto debajo del video */}
            <p className="text-center text-sm md:text-lg text-primary font-semibold animate-pulse mt-6">
              👇 MIRA EL VIDEO COMPLETO PARA ACTIVAR TU ACCESO 👇
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: EL MANIFIESTO DEL ESTRATEGA */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <HolographicCard variant="gradient" className="p-6 sm:p-8 md:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6 text-center">
                ¿POR QUÉ LA MAYORÍA DE LOS EMPRENDEDORES{" "}
                <span className="text-muted-foreground">SE QUEDAN ESTANCADOS</span>?
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm md:text-lg text-center">
                <p>
                  Porque intentan ganar una guerra moderna con herramientas del pasado. 
                  Seguir buscando clientes "a mano" es como intentar cruzar el océano nadando 
                  cuando tienes un <span className="text-primary font-medium">jet privado a tu disposición</span>.
                </p>
                <p>
                  Si tu negocio depende 100% de que tú estés pegado al teléfono, no tienes un negocio, 
                  <span className="text-foreground font-medium"> tienes un auto-empleo que te está robando la vida</span>.
                </p>
                <p className="text-primary font-semibold text-base md:text-xl pt-4 border-t border-border/50 mt-6">
                  El Protocolo Hack no es un curso; es la <span className="text-gradient">Fase de Activación</span> para que 
                  la tecnología trabaje por ti y tu mente aprenda a cerrar tratos de alto nivel sin esfuerzo.
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: LOS 6 MOTORES DEL ARSENAL */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 px-2">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4">
              <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
              <span className="text-xs md:text-sm font-medium">LOS 6 MOTORES DEL ARSENAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
              Al entrar hoy, instalas el <span className="text-gradient">Ecosistema Completo</span> de Héctor Galensky
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              En este orden estratégico:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {arsenalMotors.map((motor, index) => (
              <HolographicCard
                key={index}
                variant={motor.price ? "gradient" : "default"}
                className="group cursor-default animate-fade-in overflow-hidden p-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Thumbnail image */}
                <div className="relative h-32 md:h-40 overflow-hidden">
                  <img 
                    src={motor.thumbnail} 
                    alt={motor.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                  {/* Number badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{motor.number}</span>
                  </div>
                  {/* Price badge if premium */}
                  {motor.price && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
                      <span className="text-xs font-bold text-primary-foreground">{motor.price}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-heading font-bold text-base md:text-lg mb-1 group-hover:text-primary transition-colors">
                    {motor.title}
                  </h3>
                  <p className="text-xs md:text-sm text-secondary font-medium mb-2">
                    ADN: {motor.adn}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">{motor.description}</p>
                </div>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: LOS BONOS DE INTELIGENCIA ARTIFICIAL */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4 border border-secondary/50">
                <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
                <span className="text-xs md:text-sm font-medium text-secondary">LOS BONOS DE INTELIGENCIA ARTIFICIAL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                SOLO POR ESTA FASE DE ACTIVACIÓN, RECIBES{" "}
                <span className="text-gradient">MIS DOS ARMAS SECRETAS</span>:
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {aiBonuses.map((bonus, index) => (
                <HolographicCard
                  key={index}
                  variant="glow"
                  className="p-6 md:p-8 animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Glow effect */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center flex-shrink-0">
                        <bonus.icon className="w-6 h-6 md:w-7 md:h-7 text-secondary" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-secondary uppercase tracking-wider">BONO {index + 1}</span>
                        <h3 className="font-heading font-bold text-lg md:text-xl">{bonus.title}</h3>
                        <p className="text-sm text-primary font-medium">{bonus.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">{bonus.description}</p>
                    {bonus.value && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Valor Individual:</span>
                        <span className="text-lg font-bold text-secondary">{bonus.value}</span>
                      </div>
                    )}
                  </div>
                </HolographicCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 7: AUTORIDAD - Héctor Galensky */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4">
                <Crown className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-medium">AUTORIDAD</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-6">
                ¿Quién es <span className="text-gradient">Héctor Galensky</span>?
              </h2>
              
              {/* Quote */}
              <div className="relative max-w-3xl mx-auto mb-8">
                <div className="absolute -left-4 top-0 text-6xl text-primary/30 font-serif">"</div>
                <blockquote className="text-lg md:text-2xl font-heading italic text-foreground/90 px-8">
                  El éxito que te quita la libertad no es éxito, es una jaula. Si te roba la vida no es éxito, es una carga.
                </blockquote>
                <div className="absolute -right-4 bottom-0 text-6xl text-primary/30 font-serif">"</div>
              </div>
            </div>

            <HolographicCard variant="glow" className="p-6 md:p-10 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 space-y-6">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Héctor Galensky no es solo un estratega con <span className="text-primary font-semibold">25 años de trayectoria</span>; es el mentor que ha guiado a miles de personas en <span className="text-secondary font-semibold">100 países</span> a recuperar su activo más valioso: <span className="text-foreground font-medium">el tiempo</span>. Tras construir imperios globales, entendió que el verdadero poder no está en trabajar más horas, sino en diseñar un sistema que trabaje por ti.
                </p>
                
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Como padre y mentor, su obsesión es clara: entregarte la <span className="text-secondary font-semibold">Inteligencia Artificial</span> para que dejes de ser el operario de tu negocio y te conviertas en el <span className="text-primary font-semibold">Arquitecto de tu Libertad</span>. Héctor ya recorrió el camino difícil y cometió los errores, para que tú solo tengas que instalar el resultado y proteger lo que realmente importa.
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: LA OFERTA IRRESISTIBLE - THE STACK */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4">
                <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-medium">LA OFERTA IRRESISTIBLE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                RESUMEN DE TU <span className="text-gradient">ACTIVACIÓN</span>:
              </h2>
            </div>

            {/* Stack List */}
            <HolographicCard className="p-6 md:p-8 mb-6">
              <div className="space-y-3">
                {offerStack.map((item, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-3 md:p-4 rounded-xl transition-all",
                      item.isPremium && "bg-primary/10 border border-primary/30",
                      item.isBonus && "bg-secondary/10 border border-secondary/30",
                      !item.isPremium && !item.isBonus && "bg-muted/30 border border-border/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={cn(
                        "w-5 h-5 flex-shrink-0",
                        item.isPremium && "text-primary",
                        item.isBonus && "text-secondary",
                        !item.isPremium && !item.isBonus && "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "font-medium text-sm md:text-base",
                        item.isBonus && "text-secondary"
                      )}>
                        {item.title}
                      </span>
                    </div>
                    <span className={cn(
                      "font-bold text-sm md:text-base whitespace-nowrap",
                      item.isPremium && "text-primary",
                      item.isBonus && "text-secondary",
                      !item.isPremium && !item.isBonus && "text-muted-foreground"
                    )}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 border-t-2 border-dashed border-border" />

              {/* Total & Price */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm md:text-base mb-1">VALOR TOTAL:</p>
                <p className="text-2xl md:text-3xl font-heading font-bold text-muted-foreground line-through mb-4">
                  $3,886 USD
                </p>
                <p className="text-lg md:text-xl text-secondary font-semibold mb-2">OFERTA DE ACCESO TOTAL:</p>
                <p className="text-4xl md:text-6xl font-heading font-bold text-gradient neon-text mb-4">
                  $499 USD
                </p>
                <p className="text-sm md:text-base text-muted-foreground mb-6">
                  (Ahorras más de <span className="text-primary font-bold">$3,300 USD</span> y obtienes el Arsenal de Ejecución completo de por vida)
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 9: GARANTÍA */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <HolographicCard className="p-6 sm:p-8 md:p-10 text-center relative overflow-hidden">
              <div className="relative z-10">
                <img 
                  src={warrantyBadge} 
                  alt="Garantía de Riesgo Cero" 
                  className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 object-contain"
                />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6">
                  GARANTÍA DE <span className="text-gradient">RIESGO CERO</span> POR 7 DÍAS
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground">
                  Si en una semana no sientes que este sistema te ahorrará años de esfuerzo y multiplicará tus ventas, 
                  <span className="text-primary font-semibold"> te devuelvo el 100% de tu dinero</span>.
                </p>
                <p className="text-base md:text-lg text-foreground font-medium mt-4">
                  Sin preguntas. El riesgo es todo mío.
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 10: LLAMADO A LA ACCIÓN FINAL */}
      <section className="py-10 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Closing headline */}
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6">
                ¿VAS A SEGUIR OPERANDO{" "}
                <span className="text-muted-foreground">MANUALMENTE</span>{" "}
                O VAS A INSTALAR EL{" "}
                <span className="text-gradient neon-text">PROTOCOLO</span>?
              </h2>
            </div>

            {/* Final CTA */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl glass-strong holographic-border">
              {/* Background effects */}
              <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 md:w-64 h-48 md:h-64 bg-secondary/20 rounded-full blur-3xl" />

              <div className="relative p-8 sm:p-10 md:p-16 text-center">
                <NeonButton size="xl" onClick={() => navigate("/register")} className="w-full sm:w-auto text-sm md:text-lg px-8 md:px-12 py-4 md:py-6">
                  ¡SÍ, QUIERO ACTIVAR MI PROTOCOLO HACK POR $499!
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </NeonButton>
                <p className="text-xs md:text-sm text-muted-foreground mt-4">
                  Acceso inmediato a los 6 programas y los 2 Agentes de IA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
