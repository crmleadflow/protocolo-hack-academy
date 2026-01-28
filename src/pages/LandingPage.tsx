import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, ChevronRight, Star, Users, BookOpen, Award, Sparkles, ArrowRight, Quote } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/particle-background";
import { NeonButton } from "@/components/ui/neon-button";
import { CourseCarousel } from "@/components/courses/CourseCarousel";
import { HolographicCard } from "@/components/ui/holographic-card";
import { courses, testimonials, platformStats, categories } from "@/data/demo-data";
import { cn } from "@/lib/utils";

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

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const featuredCourses = courses.filter((c) => c.isFeatured);
  const newCourses = courses.filter((c) => c.isNew);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground particleCount={40} />
      <Header transparent />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Plataforma #1 en Educación Tech</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Domina el{" "}
              <span className="text-gradient neon-text">Futuro</span>
              <br />
              del Desarrollo
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Aprende las habilidades más demandadas del mercado con cursos creados por expertos de Google, Meta, Amazon y más.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <NeonButton size="xl" onClick={() => navigate("/register")}>
                Comenzar Gratis
                <ArrowRight className="w-5 h-5" />
              </NeonButton>
              <NeonButton variant="outline" size="xl" onClick={() => navigate("/catalog")}>
                <Play className="w-5 h-5" />
                Ver Demo
              </NeonButton>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary">
                  <AnimatedCounter end={platformStats.students} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Estudiantes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-secondary">
                  <AnimatedCounter end={platformStats.courses} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Cursos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-accent">
                  <AnimatedCounter end={platformStats.completionRate} suffix="%" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Tasa de Completitud</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 font-medium">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <CourseCarousel
            title="Cursos Destacados"
            subtitle="Seleccionados por nuestros expertos"
            courses={featuredCourses}
            variant="featured"
            onViewAll={() => navigate("/catalog")}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Explora por <span className="text-gradient">Categoría</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encuentra el camino de aprendizaje perfecto para ti
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link key={category.id} to={`/catalog?category=${category.id}`}>
                <HolographicCard
                  className={cn(
                    "text-center py-8 animate-fade-in",
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} cursos</p>
                </HolographicCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Courses */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <CourseCarousel
            title="Nuevos Lanzamientos"
            subtitle="Contenido fresco cada semana"
            courses={newCourses.length > 0 ? newCourses : courses.slice(0, 4)}
            variant="default"
            onViewAll={() => navigate("/catalog?sort=newest")}
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              ¿Por qué <span className="text-gradient">Protocolo Hack</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Más que una plataforma de cursos, somos tu compañero en el camino hacia el éxito
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: "Instructores Expertos",
                description: "Aprende de profesionales de empresas top como Google, Meta y Amazon",
              },
              {
                icon: BookOpen,
                title: "Contenido Actualizado",
                description: "Cursos constantemente actualizados con las últimas tecnologías",
              },
              {
                icon: Users,
                title: "Comunidad Activa",
                description: "Conecta con miles de estudiantes y expertos en nuestra comunidad",
              },
              {
                icon: Star,
                title: "Certificaciones",
                description: "Obtén certificados reconocidos por la industria tech",
              },
            ].map((feature, index) => (
              <HolographicCard
                key={index}
                variant="gradient"
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Lo que dicen nuestros <span className="text-gradient">Estudiantes</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Miles de profesionales han transformado sus carreras con nosotros
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <HolographicCard
                key={testimonial.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Quote className="w-8 h-8 text-primary/40 mb-4" />
                <p className="text-sm text-muted-foreground mb-6 line-clamp-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full border-2 border-primary"
                  />
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl glass-strong holographic-border">
            {/* Background effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                ¿Listo para comenzar tu{" "}
                <span className="text-gradient neon-text">transformación</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Únete a más de 125,000 estudiantes y comienza tu camino hacia el éxito profesional hoy mismo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <NeonButton size="xl" onClick={() => navigate("/register")}>
                  Crear Cuenta Gratis
                  <ChevronRight className="w-5 h-5" />
                </NeonButton>
                <NeonButton variant="outline" size="lg" onClick={() => navigate("/catalog")}>
                  Explorar Cursos
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
