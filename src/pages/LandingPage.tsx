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
import prospectMachineThumb from "@/assets/prospect-machine-thumbnail.jpg";
import videoMagnetThumb from "@/assets/video-magnet-thumbnail.png";
import productCreatorThumb from "@/assets/product-creator-pro-thumbnail.png";

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
const arsenalPillars = [
  {
    thumbnail: iaBusinessLabThumb,
    title: "IA-Sales Master",
    description: "Pon a un ejército de robots a prospectar, calificar y filtrar clientes por ti las 24 horas del día.",
  },
  {
    thumbnail: neuroTalkThumb,
    title: "Neuro-Talk",
    description: "El lenguaje de la neuro-persuasión para que el cerebro de tu cliente confíe en ti y el 'SÍ' sea su única respuesta lógica.",
  },
  {
    thumbnail: fastBrandThumb,
    title: "Marca Imbatible",
    description: "Construye una autoridad magnética que haga que los clientes te busquen a ti, eliminando la necesidad de perseguirlos.",
  },
  {
    thumbnail: protocoloHackThumb,
    title: "Mindset de Éxito",
    description: "Hackeo cerebral profundo para eliminar bloqueos de escasez e instalar el sistema operativo de un Top Earner.",
  },
  {
    thumbnail: videoMagnetThumb,
    title: "Automate-X",
    description: "La arquitectura para automatizar todos tus procesos de venta. Tu negocio crece con precisión mientras tú recuperas tu libertad.",
  },
  {
    thumbnail: prospectMachineThumb,
    title: "Client Factory",
    description: "Tu generador de prospectos calificados en automático. Un flujo constante de personas interesadas directo a tu WhatsApp.",
  },
  {
    thumbnail: productCreatorThumb,
    title: "Digital Empire",
    description: "Aprende a empaquetar tu conocimiento en productos digitales (cursos y e-books) que facturen de forma masiva y constante.",
  }
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

// Stack/Offer items
const stackItems = [
  {
    title: "El Arsenal Completo (Los 7 Programas)",
    value: "$1,997 USD",
    included: true
  },
  {
    title: "BONO 1: Librería Privada de Prompts de IA",
    description: "El diccionario exacto para que la tecnología trabaje por ti.",
    included: true
  },
  {
    title: "BONO 2: Comunidad VIP de Implementadores",
    description: "El entorno de alto nivel para acelerar tus resultados.",
    included: true
  },
  {
    title: "BONO 3: Masterclass de Cierres de Grado Militar",
    description: "Técnicas de élite para situaciones de alta presión.",
    included: true
  }
];

// FAQs
const faqs = [
  {
    question: "¿Necesito saber de tecnología?",
    answer: "No, el sistema está diseñado para ser instalado paso a paso. Te guiamos en cada etapa del proceso."
  },
  {
    question: "¿Cuándo veo resultados?",
    answer: "El pilar de generación de clientes puede activarse en tus primeras 24 horas."
  }
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

      {/* SECCIÓN 1: FILTRO DE AUDIENCIA */}
      <section className="relative pt-20 md:pt-24 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-xl p-4 md:p-6 text-center border border-primary/30">
              <p className="text-sm md:text-base text-muted-foreground">
                <span className="text-primary font-semibold">Atención:</span> Este sistema está reservado exclusivamente para{" "}
                <span className="text-foreground font-medium">Networkers, Emprendedores y Dueños de Negocio</span>{" "}
                decididos a dejar de perseguir clientes y empezar a dominar su mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: TITULAR MAESTRO (Hero) */}
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
              <span className="text-foreground">El Ecosistema de IA y Neuro-Persuasión que Hackea tu Mente para Automatizar tus Ventas, Escalar tu Marca y Crear un Imperio Digital en Piloto Automático.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 px-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              No te limites a estudiar el éxito, <span className="text-primary font-semibold">instálalo</span>. 
              Accede al Arsenal de Ejecución definitivo y activa el atajo del{" "}
              <span className="text-secondary font-semibold">'SÍ'</span> en cada conversación de negocio.
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
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: AGITACIÓN DEL PROBLEMA */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <HolographicCard variant="gradient" className="p-6 sm:p-8 md:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6 text-center">
                ¿Sientes que estás peleando una guerra moderna con{" "}
                <span className="text-muted-foreground">herramientas del pasado</span>?
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm md:text-lg text-center">
                <p>
                  El mercado cambió. Los guiones de ventas tradicionales y el esfuerzo manual ya no son suficientes.
                </p>
                <p>
                  Si no tienes un sistema que trabaje por ti mientras duermes, no tienes un negocio;{" "}
                  <span className="text-foreground font-medium">tienes un auto-empleo que te agota.</span>
                </p>
                <p className="text-primary font-semibold text-base md:text-xl pt-2">
                  Es momento de dejar de 'intentar' y empezar a <span className="text-gradient">'Hackear'</span> tus resultados.
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: LOS 7 PILARES DEL ARSENAL */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 px-2">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4">
              <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
              <span className="text-xs md:text-sm font-medium">Arsenal de Ejecución</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
              Instala los <span className="text-gradient">7 Componentes</span> de tu nuevo Arsenal
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {arsenalPillars.map((pillar, index) => (
              <HolographicCard
                key={index}
                className="group cursor-default animate-fade-in overflow-hidden p-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Thumbnail image */}
                <div className="relative h-28 md:h-36 overflow-hidden">
                  <img 
                    src={pillar.thumbnail} 
                    alt={pillar.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-heading font-semibold text-sm md:text-lg mb-1 md:mb-2 group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{pillar.description}</p>
                </div>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: AUTORIDAD - Héctor Galensky */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
                <span className="text-gradient">Héctor Galensky:</span> El Arquitecto detrás del Protocolo
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Con más de <span className="text-primary font-semibold">25 años de resultados comprobados</span>, Héctor ha sido Top Earner en 7 compañías, 
                ha construido comunidades de más de <span className="text-secondary font-semibold">380,000 personas en 94 países</span> y es el creador de Lead Navigator.
              </p>
              <p className="text-muted-foreground text-sm md:text-base mt-3">
                Hoy, entrega su <span className="text-foreground font-medium">Arsenal de Ejecución personal</span> para que tú no tengas que adivinar el camino al éxito.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {credentials.map((credential, index) => (
                <HolographicCard
                  key={index}
                  variant="gradient"
                  className="text-center animate-fade-in p-4 md:p-6"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-3 md:mb-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <credential.icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm md:text-lg mb-1 md:mb-2">{credential.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{credential.description}</p>
                </HolographicCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 7: LA OFERTA IRRESISTIBLE (The Stack) */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4">
                <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-medium">Tu Inversión</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold">
                Tu <span className="text-gradient">Instalación Completa</span> al Protocolo Hack incluye:
              </h2>
            </div>

            <HolographicCard variant="gradient" className="p-6 sm:p-8 md:p-10">
              <div className="space-y-4 md:space-y-6">
                {stackItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 md:gap-4">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">
                        {item.title}
                        {item.value && <span className="text-muted-foreground ml-2">— Valor real de {item.value}</span>}
                      </p>
                      {item.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-border text-center">
                <p className="text-muted-foreground text-sm md:text-base mb-2">VALOR TOTAL:</p>
                <p className="text-2xl md:text-3xl font-heading font-bold text-muted-foreground line-through mb-2">$2,341 USD</p>
                <p className="text-lg md:text-xl text-primary font-semibold mb-4">PRECIO DE LANZAMIENTO SUMMIT:</p>
                <p className="text-4xl md:text-5xl font-heading font-bold text-gradient neon-text mb-6">SOLO $XX USD</p>
                <NeonButton size="xl" onClick={() => navigate("/register")} className="w-full sm:w-auto">
                  ¡ACTIVAR PROTOCOLO HACK AHORA!
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </NeonButton>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: GARANTÍA DE SATISFACCIÓN */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <HolographicCard className="p-6 sm:p-8 md:p-10 text-center relative overflow-hidden">
              {/* Shield icon background */}
              <Shield className="absolute top-4 right-4 w-20 h-20 md:w-32 md:h-32 text-primary/5" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6">
                  <span className="text-gradient">Garantía Blindada</span> de 7 Días
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground">
                  "Entra, descarga el arsenal y úsalo. Si en una semana no sientes que este sistema ha transformado tu visión de los negocios, 
                  <span className="text-foreground font-medium"> te devuelvo el 100% de tu dinero</span>. 
                  El riesgo de esta inversión es totalmente mío."
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* SECCIÓN 9: CIERRE Y FAQs */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Closing headline */}
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6">
                ¿Vas a seguir operando con el{" "}
                <span className="text-muted-foreground">sistema antiguo</span>{" "}
                o vas a instalar el{" "}
                <span className="text-gradient neon-text">Protocolo Hack</span>?
              </h2>
            </div>

            {/* FAQs */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h3 className="text-lg md:text-xl font-heading font-semibold">Preguntas Frecuentes</h3>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="glass rounded-xl px-4 md:px-6 border-0">
                    <AccordionTrigger className="text-sm md:text-base font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Final CTA */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl glass-strong holographic-border">
              {/* Background effects */}
              <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 md:w-64 h-48 md:h-64 bg-secondary/20 rounded-full blur-3xl" />

              <div className="relative p-8 sm:p-10 md:p-16 text-center">
                <NeonButton size="xl" onClick={() => navigate("/register")} className="w-full sm:w-auto text-sm md:text-base">
                  ¡INICIAR DESCARGA DEL PROTOCOLO HACK AHORA!
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </NeonButton>
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
