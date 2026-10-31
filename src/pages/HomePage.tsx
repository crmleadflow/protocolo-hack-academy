import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Download, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ECOSYSTEM, TOOLS, MENTORSHIPS, LEADFLOW_PLANS, CONFERENCES, RESOURCES, EVENTS, FAQS } from "@/components/public/content";

const Kinetic = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => (
  <span className={className}>
    {text.split(" ").map((w, i) => (
      <span key={i} className="kinetic-word mr-[0.25em]" style={{ animationDelay: `${delay + i * 0.12}s` }}>
        {w}
      </span>
    ))}
  </span>
);

const SectionHead = ({ kicker, title, accent, to, link }: { kicker: string; title: string; accent?: string; to?: string; link?: string }) => (
  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-primary">{kicker}</p>
      <h2 className="mt-3 text-3xl font-bold md:text-5xl">
        {title} {accent && <span className="serif-accent text-primary">{accent}</span>}
      </h2>
    </div>
    {to && (
      <Link to={to} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        {link} <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);

const Card = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={to} className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50">
    {children}
  </Link>
);

const HomePage = () => {
  const { data: courses = [] } = useQuery({
    queryKey: ["home-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("programs").select("id,title,description,thumbnail_url").order("sort_order").limit(3);
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      {/* 1. Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 md:pt-32">
        <p className="kinetic-word text-xs uppercase tracking-[0.25em] text-primary">Protocolo Hack · Héctor Galensky</p>
        <h1 className="mt-6 text-[2.6rem] font-bold leading-[1] md:text-7xl lg:text-8xl">
          <Kinetic text="EL CONOCIMIENTO CAMBIA TU" />
          <Kinetic text="mente." delay={0.6} className="serif-accent text-primary normal-case" />
          <br />
          <Kinetic text="LA IMPLEMENTACIÓN CAMBIA TU" delay={1} />
          <Kinetic text="negocio." delay={1.6} className="serif-accent text-primary normal-case" />
        </h1>
        <p className="kinetic-word mt-8 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "1.9s" }}>
          Aprende inteligencia artificial, neuroventas y estrategias digitales. Descubre herramientas, mentorías y
          soluciones para llevar tu negocio al siguiente nivel.
        </p>
        <div className="kinetic-word mt-10 flex flex-wrap gap-3" style={{ animationDelay: "2.1s" }}>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/academia">Explorar academia <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/marketplace">Descubrir herramientas</Link>
          </Button>
        </div>
      </section>

      {/* 2. Ecosistema */}
      <section className="border-y border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead kicker="El ecosistema" title="Aprende, implementa y" accent="escala." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ECOSYSTEM.map(({ to, icon: Icon, title, text }) => (
              <Card key={to} to={to}>
                <Icon className="h-6 w-6 text-primary" />
                <p className="mt-6 font-heading text-lg font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Cursos */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <SectionHead kicker="Academia" title="Cursos" accent="destacados" to="/academia" link="Ver academia" />
        <div className="grid gap-4 md:grid-cols-3">
          {(courses.length ? courses : [{ id: "x", title: "Nuevos cursos muy pronto", description: "", thumbnail_url: null }]).map((c: any) => (
            <Card key={c.id} to="/academia">
              <div className="aspect-video overflow-hidden rounded-2xl bg-secondary">
                {c.thumbnail_url && <img src={c.thumbnail_url} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
              </div>
              <p className="mt-5 font-heading text-lg font-semibold line-clamp-1">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Herramientas */}
      <section className="bg-foreground text-background py-20">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Marketplace</p>
          <h2 className="mt-3 text-3xl font-bold md:text-5xl">Plugins y <span className="serif-accent">herramientas</span></h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.name} to="/marketplace" className="rounded-3xl border border-background/15 p-6 transition-colors hover:bg-background/5">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{t.tag}</span>
                <p className="mt-6 font-heading text-xl font-semibold">{t.name}</p>
                <p className="mt-1 text-sm opacity-70">{t.text}</p>
                <p className="mt-6 font-heading font-semibold">{t.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Mentorías */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <SectionHead kicker="Mentorías" title="Acompañamiento" accent="personal" to="/mentorias" link="Ver mentorías" />
        <div className="grid gap-4 md:grid-cols-3">
          {MENTORSHIPS.map((m) => (
            <Card key={m.name} to="/mentorias">
              <p className="text-xs text-primary">{m.format}</p>
              <p className="mt-3 font-heading text-lg font-semibold">{m.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Lead Flow */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="rounded-[2rem] bg-primary p-8 text-primary-foreground md:p-14">
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">Lead Flow</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">Deja de perder clientes. <span className="serif-accent">Ordena tus ventas.</span></h2>
          <p className="mt-4 max-w-xl opacity-80">El CRM para captar, seguir y cerrar oportunidades. Planes desde emprendedores hasta empresas.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {LEADFLOW_PLANS.map((p) => <span key={p.name} className="rounded-full border border-primary-foreground/30 px-4 py-1.5 text-sm">{p.name}</span>)}
          </div>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full">
            <Link to="/lead-flow">Ver planes <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* 7. Conferencias */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <SectionHead kicker="Empresas" title="Conferencias" accent="empresariales" to="/conferencias" link="Solicitar conferencia" />
        <div className="divide-y divide-border border-y border-border">
          {CONFERENCES.map((c) => (
            <Link key={c.name} to="/conferencias" className="group flex items-center justify-between gap-6 py-6">
              <div>
                <p className="font-heading text-xl font-semibold md:text-2xl group-hover:text-primary transition-colors">{c.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* 8 + 9. Recursos y eventos */}
      <section className="mx-auto max-w-7xl px-5 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Gratis</p>
          <h3 className="mt-3 text-2xl font-bold md:text-3xl">Recursos <span className="serif-accent text-primary">gratuitos</span></h3>
          <ul className="mt-6 space-y-3">
            {RESOURCES.map((r) => (
              <li key={r.name}>
                <Link to="/recursos" className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm hover:bg-muted">
                  <span>{r.name}</span><Download className="h-4 w-4 text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">En vivo</p>
          <h3 className="mt-3 text-2xl font-bold md:text-3xl">Próximos <span className="serif-accent text-primary">eventos</span></h3>
          <ul className="mt-6 space-y-3">
            {EVENTS.map((e) => (
              <li key={e.name}>
                <Link to="/eventos" className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm hover:bg-muted">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="flex-1">{e.name}</span>
                  <span className="text-xs text-muted-foreground">{e.mode}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10. Comunidad */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Comunidad</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold md:text-5xl">No escales <span className="serif-accent text-primary">solo.</span></h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Comparte avances, resuelve dudas y conecta con emprendedores que están implementando lo mismo que tú.</p>
        <Button asChild variant="outline" size="lg" className="mt-8 rounded-full"><Link to="/comunidad">Unirme a la comunidad</Link></Button>
      </section>

      {/* 11. FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="text-3xl font-bold md:text-4xl">Preguntas <span className="serif-accent text-primary">frecuentes</span></h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left font-heading">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 12. CTA */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="rounded-[2rem] border border-border bg-card px-8 py-16 text-center md:py-24">
          <h2 className="text-4xl font-bold md:text-6xl">Aprende. Implementa. <span className="serif-accent text-primary">Escala.</span></h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Todo en un solo ecosistema. Empieza gratis hoy.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full"><Link to="/login">Crear mi cuenta</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/recursos">Ver recursos gratis</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
