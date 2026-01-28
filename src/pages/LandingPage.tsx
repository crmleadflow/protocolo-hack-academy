import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, ChevronRight, Star, Sparkles, ArrowRight, Quote,
  Zap, Target, Mic, Bot, Video, Crown, Package, UserCheck, Rocket, Globe, TrendingUp, Users
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { HolographicCard } from "@/components/ui/holographic-card";
import { cn } from "@/lib/utils";
import hectorImage from "@/assets/hector-galensky-hero.png";

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

// Programs data
const programs = [
  {
    id: "protocolo-hack",
    title: "Protocolo Hack",
    description: "Mi programa insignia para hackear tu potencial financiero.",
    icon: Zap,
    color: "primary",
  },
  {
    id: "neuro-talk",
    title: "Neuro Talk",
    description: "Domina la neuro oratoria persuasiva para cerrar ventas con el poder de tu comunicación.",
    icon: Mic,
    color: "secondary",
  },
  {
    id: "closer-project",
    title: "Closer Project",
    description: "Conviértete en un cerrador de élite capaz de manejar cualquier objeción.",
    icon: Target,
    color: "accent",
  },
  {
    id: "ia-negocio",
    title: "IA para tu Negocio",
    description: "Aprende a automatizar procesos y delegar tareas operativas a la inteligencia artificial.",
    icon: Bot,
    color: "primary",
  },
  {
    id: "video-magnet",
    title: "Video Magnet",
    description: "Estrategias de contenido en video que atraen prospectos calificados en automático.",
    icon: Video,
    color: "secondary",
  },
  {
    id: "marca-personal",
    title: "Escalar tu Marca Personal",
    description: "Pasa de ser un desconocido a ser una autoridad en tu nicho.",
    icon: Crown,
    color: "accent",
  },
  {
    id: "producto-digital",
    title: "Producto Digital",
    description: "Mi guía paso a paso para monetizar tu conocimiento desde cero.",
    icon: Package,
    color: "primary",
  },
];

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
    title: "Lead Navigator CRM",
    description: "Creador de tecnología de prospección",
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground particleCount={40} />
      <Header transparent />

      {/* Hero Section */}
      <section className="relative flex items-center pt-24 pb-8">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">La Central de Inteligencia</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-gradient neon-text">Protocolo Hack</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl font-heading text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              de <span className="text-foreground font-semibold">Hector Galensky</span>
            </p>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              El ecosistema de alto rendimiento donde el conocimiento se transforma en{" "}
              <span className="text-primary font-medium">resultados financieros</span> y{" "}
              <span className="text-secondary font-medium">personales</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <NeonButton size="xl" onClick={() => navigate("/register")}>
                Accede a la Inteligencia
                <ArrowRight className="w-5 h-5" />
              </NeonButton>
              <NeonButton variant="outline" size="xl" onClick={() => navigate("/catalog")}>
                <Play className="w-5 h-5" />
                Ver Programas
              </NeonButton>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary">
                <AnimatedCounter end={380000} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Comunidad Global</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary">
                <AnimatedCounter end={94} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Países</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-accent">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Años de Experiencia</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
              <span className="ml-2 font-medium">Top Earner</span>
            </div>
          </div>
        </div>
      </section>


      {/* Mentor Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center mb-12">
              {/* Image */}
              <div className="relative flex justify-center">
                <div className="relative">
                  {/* Glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 blur-3xl scale-110 rounded-full" />
                  <img 
                    src={hectorImage} 
                    alt="Hector Galensky" 
                    className="relative z-10 max-w-md w-full h-auto drop-shadow-2xl"
                    style={{ mixBlendMode: 'normal' }}
                  />
                </div>
              </div>
              
              {/* Text */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  Un Solo Mentor: <span className="text-gradient">Hector Galensky</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  En un mundo lleno de teóricos, Protocolo Hack se basa en la práctica. 
                  Mi autoridad no viene de los títulos, sino de los <span className="text-primary">resultados comprobados</span>.
                </p>
                <p className="text-muted-foreground">
                  Empresario, visionario y entrenador de élite. Con más de 25 años de trayectoria, 
                  he construido comunidades de más de 380,000 personas y soy Top Earner en múltiples compañías a nivel global.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {credentials.map((credential, index) => (
                <HolographicCard
                  key={index}
                  variant="gradient"
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <credential.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{credential.title}</h3>
                  <p className="text-sm text-muted-foreground">{credential.description}</p>
                </HolographicCard>
              ))}
            </div>

            {/* Expertise badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {["Neuro Oratoria", "Marketing Digital", "Network Marketing", "Automatización", "Lead Navigator CRM"].map((skill, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-full glass text-sm font-medium text-primary animate-fade-in"
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
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Rocket className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">Programas Incluidos</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Tu <span className="text-gradient">Arsenal de Entrenamiento</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              El aprendizaje es integral. No dividimos por categorías porque el éxito es una mezcla de mentalidad, técnica y herramientas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <HolographicCard
                key={program.id}
                className={cn(
                  "group cursor-pointer animate-fade-in",
                  index === 0 && "md:col-span-2 lg:col-span-1"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn(
                  "w-12 h-12 mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  program.color === "primary" && "bg-primary/20",
                  program.color === "secondary" && "bg-secondary/20",
                  program.color === "accent" && "bg-accent/20"
                )}>
                  <program.icon className={cn(
                    "w-6 h-6",
                    program.color === "primary" && "text-primary",
                    program.color === "secondary" && "text-secondary",
                    program.color === "accent" && "text-accent"
                  )} />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {program.title}
                </h3>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>

      {/* La Hermandad Hack */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl glass-strong holographic-border">
            {/* Background effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative p-12 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                    <UserCheck className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Comunidad Exclusiva</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                    La <span className="text-gradient">Hermandad Hack</span>
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Al unirte, accedes a una comunidad exclusiva de emprendedores que hablan tu mismo idioma, donde la colaboración y el networking son la base del crecimiento.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Networking con emprendedores de alto nivel",
                      "Colaboración y apoyo mutuo",
                      "Acceso a nuevos módulos constantemente",
                      "Contenido actualizado cada semana"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <HolographicCard className="text-center py-8">
                      <div className="text-3xl font-heading font-bold text-primary mb-2">
                        <AnimatedCounter end={7} suffix="+" />
                      </div>
                      <p className="text-sm text-muted-foreground">Programas Incluidos</p>
                    </HolographicCard>
                    <HolographicCard className="text-center py-8">
                      <div className="text-3xl font-heading font-bold text-secondary mb-2">∞</div>
                      <p className="text-sm text-muted-foreground">Actualizaciones</p>
                    </HolographicCard>
                    <HolographicCard className="text-center py-8">
                      <div className="text-3xl font-heading font-bold text-accent mb-2">24/7</div>
                      <p className="text-sm text-muted-foreground">Acceso Total</p>
                    </HolographicCard>
                    <HolographicCard className="text-center py-8">
                      <div className="text-3xl font-heading font-bold text-primary mb-2">VIP</div>
                      <p className="text-sm text-muted-foreground">Comunidad</p>
                    </HolographicCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
              Lo que dicen los <span className="text-gradient">Resultados</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Entrenar con Hector no es solo aprender marketing, es cambiar la forma en la que ves los negocios.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <HolographicCard variant="gradient" className="relative overflow-hidden">
              <Quote className="absolute top-6 left-6 w-16 h-16 text-primary/10" />
              <div className="p-8 md:p-12 text-center">
                <p className="text-xl md:text-2xl font-medium mb-8 relative z-10">
                  "Mi facturación se <span className="text-primary">triplicó en 90 días</span> usando sus estrategias de automatización."
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground">— Miembro de Protocolo Hack</p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl glass-strong holographic-border">
            {/* Background effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                ¿Estás listo para dejar de{" "}
                <span className="text-muted-foreground">intentar</span> y empezar a{" "}
                <span className="text-gradient neon-text">lograr</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                Bienvenido a la era de la precisión.
              </p>
              <p className="text-xl font-heading font-semibold text-primary mb-10">
                Bienvenido a Protocolo Hack.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <NeonButton size="xl" onClick={() => navigate("/register")}>
                  Únete Ahora
                  <ChevronRight className="w-5 h-5" />
                </NeonButton>
                <NeonButton variant="outline" size="lg" onClick={() => navigate("/catalog")}>
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
