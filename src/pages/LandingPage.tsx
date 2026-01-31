import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, ChevronRight, Sparkles, ArrowRight, Quote, Star,
  Zap, Target, Mic, Bot, Video, Crown, Package, UserCheck, Rocket, Globe, TrendingUp, Users, BookOpen, Loader2
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { HolographicCard } from "@/components/ui/holographic-card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import hectorVideo from "@/assets/protocolo_1.mp4";

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

// Icon mapping for programs (fallback icons based on program title keywords)
const getIconForProgram = (title: string): React.ElementType => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("protocolo") || titleLower.includes("hack")) return Zap;
  if (titleLower.includes("neuro") || titleLower.includes("talk")) return Mic;
  if (titleLower.includes("prospect") || titleLower.includes("machine")) return Target;
  if (titleLower.includes("ia") || titleLower.includes("business") || titleLower.includes("lab")) return Bot;
  if (titleLower.includes("video") || titleLower.includes("magnet")) return Video;
  if (titleLower.includes("brand") || titleLower.includes("accelerator")) return Crown;
  if (titleLower.includes("product") || titleLower.includes("creator")) return Package;
  return BookOpen;
};

// Color cycling for programs
const programColors = ["primary", "secondary", "accent"] as const;

// Program type from database
interface Program {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

// Mentor credentials
const credentials = [
  {
    icon: Globe,
    title: "25+ años de experiencia",
    description: "Trayectoria en mundo corporativo y Network Marketing",
  },
  {
    icon: Users,
    title: "380,000+ personas",
    description: "Comunidades construidas a nivel global",
  },
  {
    icon: TrendingUp,
    title: "94+ países",
    description: "Conferencista internacional de élite",
  },
  {
    icon: Bot,
    title: "Herramientas de automatización",
    description: "Creador de tecnología de prospección",
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      // Unmute on first interaction
      if (videoRef.current.muted) {
        videoRef.current.muted = false;
      }
      
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from("programs")
          .select("id, title, description, thumbnail_url, sort_order")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setPrograms(data || []);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground particleCount={40} />
      <Header transparent />

      {/* Hero Section */}
      <section className="relative flex items-center pt-20 md:pt-24 pb-0">
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
              <span className="text-xs md:text-sm font-medium">La Central de Inteligencia</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-gradient neon-text">Protocolo Hack</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl font-heading text-muted-foreground mb-3 md:mb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              de <span className="text-foreground font-semibold">Hector Galensky</span>
            </p>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 px-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              El ecosistema de alto rendimiento donde el conocimiento se transforma en{" "}
              <span className="text-primary font-medium">resultados financieros</span> y{" "}
              <span className="text-secondary font-medium">personales</span>.
            </p>

            {/* Avatar Video */}
            <div 
              className="flex justify-center mb-6 md:mb-8 animate-fade-in cursor-pointer"
              style={{ animationDelay: "0.25s" }}
              onClick={toggleVideo}
            >
              <div className="relative group">
                {/* Outer glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20 rounded-2xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Holographic frame */}
                <div className="relative p-1 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent animate-pulse">
                  {/* Inner holographic border with animation */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-accent via-primary to-secondary opacity-50 animate-[spin_8s_linear_infinite]" />
                  
                  {/* Glass inner container */}
                  <div className="relative rounded-lg overflow-hidden glass-strong">
                    {/* Holographic shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none" />
                    
                    {/* Video */}
                    <video
                      ref={videoRef}
                      src={hectorVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="relative z-10 max-w-[200px] sm:max-w-xs md:max-w-sm w-full h-auto object-contain"
                    />
                    
                    {/* Pause indicator */}
                    {!isVideoPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm border border-primary/50">
                          <Play className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-secondary rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-accent rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4 animate-fade-in px-4" style={{ animationDelay: "0.3s" }}>
              <NeonButton size="xl" onClick={() => navigate("/register")} className="w-full sm:w-auto text-sm md:text-base">
                Accede a la Inteligencia
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </NeonButton>
              <NeonButton variant="outline" size="xl" onClick={() => navigate("/catalog")} className="w-full sm:w-auto text-sm md:text-base">
                <Play className="w-4 h-4 md:w-5 md:h-5" />
                Ver Programas
              </NeonButton>
            </div>
          </div>
        </div>
      </section>


      {/* Mentor Section */}
      <section className="relative z-10 pt-8 md:pt-12 pb-8 md:pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
                Un Solo Mentor: <span className="text-gradient">Hector Galensky</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-4 md:mb-6">
                En un mundo saturado de teorías vacías, existe alguien que ha caminado el camino antes que tú. 
                Su autoridad no proviene de diplomas, sino de <span className="text-primary">resultados que hablan por sí solos</span>.
              </p>
              <p className="text-muted-foreground text-sm md:text-base">
                Empresario, visionario y entrenador de élite. Con más de 25 años forjando éxitos, 
                ha construido comunidades de más de 380,000 personas y alcanzado la cima como Top Earner en múltiples compañías a nivel global. 
                <span className="text-secondary font-medium"> Ahora, está listo para guiarte hacia tu propia transformación.</span>
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

            {/* Expertise badges */}
            <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-2 md:gap-4 px-2">
              {["Neuro Ventas", "Marketing Digital", "Network Marketing", "Automatización", "Inteligencia Artificial"].map((skill, i) => (
                <div
                  key={i}
                  className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass text-xs md:text-sm font-medium text-primary animate-fade-in"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Arsenal de Entrenamiento */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 px-2">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-3 md:mb-4">
              <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
              <span className="text-xs md:text-sm font-medium">Programas Incluidos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
              Tu <span className="text-gradient">Arsenal de Entrenamiento</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              El aprendizaje es integral. No dividimos por categorías porque el éxito es una mezcla de mentalidad, técnica y herramientas.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {isLoadingPrograms ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-primary" />
              </div>
            ) : programs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground text-sm md:text-base">
                No hay programas disponibles
              </div>
            ) : (
              programs.map((program, index) => {
                const Icon = getIconForProgram(program.title);
                const color = programColors[index % programColors.length];
                
                return (
                  <HolographicCard
                    key={program.id}
                    className={cn(
                      "group cursor-pointer animate-fade-in overflow-hidden p-3 md:p-6",
                      index === 0 && "md:col-span-2 lg:col-span-1"
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {program.thumbnail_url ? (
                      <div className="relative -mx-3 md:-mx-6 -mt-3 md:-mt-6 mb-3 md:mb-4">
                        <img 
                          src={program.thumbnail_url} 
                          alt={program.title}
                          className="w-full h-24 md:h-32 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      </div>
                    ) : (
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 rounded-lg md:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                        color === "primary" && "bg-primary/20",
                        color === "secondary" && "bg-secondary/20",
                        color === "accent" && "bg-accent/20"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5 md:w-6 md:h-6",
                          color === "primary" && "text-primary",
                          color === "secondary" && "text-secondary",
                          color === "accent" && "text-accent"
                        )} />
                      </div>
                    )}
                    <h3 className="font-heading font-semibold text-sm md:text-lg mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {program.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{program.description || "Sin descripción"}</p>
                  </HolographicCard>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* La Hermandad Hack */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl glass-strong holographic-border">
            {/* Background effects */}
            <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative p-6 sm:p-8 md:p-12 lg:p-16">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass mb-4 md:mb-6">
                    <UserCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                    <span className="text-xs md:text-sm font-medium">Comunidad Exclusiva</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6">
                    La <span className="text-gradient">Hermandad Hack</span>
                  </h2>
                  <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-lg">
                    Al unirte, accedes a una comunidad exclusiva de emprendedores que hablan tu mismo idioma, donde la colaboración y el networking son la base del crecimiento.
                  </p>
                  <ul className="space-y-3 md:space-y-4 text-left">
                    {[
                      "Networking con emprendedores de alto nivel",
                      "Colaboración y apoyo mutuo",
                      "Acceso a nuevos módulos constantemente",
                      "Contenido actualizado cada semana"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 md:gap-3">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                        </div>
                        <span className="text-xs md:text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <HolographicCard className="text-center py-4 md:py-8 px-2">
                      <div className="text-xl md:text-3xl font-heading font-bold text-primary mb-1 md:mb-2">
                        <AnimatedCounter end={7} suffix="+" />
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">Programas Incluidos</p>
                    </HolographicCard>
                    <HolographicCard className="text-center py-4 md:py-8 px-2">
                      <div className="text-xl md:text-3xl font-heading font-bold text-secondary mb-1 md:mb-2">∞</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Actualizaciones</p>
                    </HolographicCard>
                    <HolographicCard className="text-center py-4 md:py-8 px-2">
                      <div className="text-xl md:text-3xl font-heading font-bold text-accent mb-1 md:mb-2">24/7</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Acceso Total</p>
                    </HolographicCard>
                    <HolographicCard className="text-center py-4 md:py-8 px-2">
                      <div className="text-xl md:text-3xl font-heading font-bold text-primary mb-1 md:mb-2">VIP</div>
                      <p className="text-xs md:text-sm text-muted-foreground">Comunidad</p>
                    </HolographicCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-2 md:mb-3">
              Lo que dicen los <span className="text-gradient">Resultados</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-xs md:text-sm">
              Entrenar con Hector no es solo aprender marketing, es cambiar la forma en la que ves los negocios.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <HolographicCard variant="gradient" className="relative overflow-hidden">
              <Quote className="absolute top-4 left-4 md:top-6 md:left-6 w-10 h-10 md:w-16 md:h-16 text-primary/10" />
              <div className="p-6 sm:p-8 md:p-12 text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-medium mb-6 md:mb-8 relative z-10">
                  "Mi facturación se <span className="text-primary">triplicó en 90 días</span> usando sus estrategias de automatización."
                </p>
                <div className="flex items-center justify-center gap-1 mb-3 md:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm md:text-base">— Miembro de Protocolo Hack</p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl glass-strong holographic-border">
            {/* Background effects */}
            <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 md:w-64 h-48 md:h-64 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative p-8 sm:p-10 md:p-16 lg:p-20 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6 px-2">
                ¿Estás listo para dejar de{" "}
                <span className="text-muted-foreground">intentar</span> y empezar a{" "}
                <span className="text-gradient neon-text">lograr</span>?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-3 md:mb-4">
                Bienvenido a la era de la precisión.
              </p>
              <p className="text-lg md:text-xl font-heading font-semibold text-primary mb-6 md:mb-10">
                Bienvenido a Protocolo Hack.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
                <NeonButton size="xl" onClick={() => navigate("/register")} className="w-full sm:w-auto text-sm md:text-base">
                  Únete Ahora
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </NeonButton>
                <NeonButton variant="outline" size="lg" onClick={() => navigate("/catalog")} className="w-full sm:w-auto text-sm md:text-base">
                  Ver Programas
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
