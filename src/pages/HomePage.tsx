import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Download, CalendarDays, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ECOSYSTEM, TOOLS, MENTORSHIPS, LEADFLOW_PLANS, CONFERENCES, RESOURCES, EVENTS, FAQS } from "@/components/public/content";
import heroImg from "@/assets/home-hero-bw.jpg";
import editorialImg from "@/assets/editorial-bw-2.jpg";
import imgAcademia from "@/assets/card-academia.jpg";
import imgMarket from "@/assets/card-marketplace.jpg";
import imgComunidad from "@/assets/card-comunidad.jpg";

const Kinetic = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => (
  <span className={className}>
    {text.split(" ").map((w, i) => (
      <span key={i} className="kinetic-word mr-[0.22em]" style={{ animationDelay: `${delay + i * 0.1}s` }}>{w}</span>
    ))}
  </span>
);

const Head = ({ kicker, title, accent, to, link }: { kicker: string; title: string; accent?: string; to?: string; link?: string }) => (
  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <span className="pill">{kicker}</span>
      <h2 className="display mt-5 text-4xl md:text-6xl">
        {title} {accent && <span className="serif-accent text-primary">{accent}</span>}
      </h2>
    </div>
    {to && (
      <Link to={to} className="pill hover:bg-foreground/10">{link} <ArrowRight className="h-3.5 w-3.5" /></Link>
    )}
  </div>
);

const FEATURES = [
  { to: "/academia", img: imgAcademia, chip: "Cursos", title: "Academia", text: "IA, neuroventas y estrategia digital paso a paso." },
  { to: "/marketplace", img: imgMarket, chip: "Plugins", title: "Herramientas", text: "Mentor IA, analizadores y productos digitales." },
  { to: "/comunidad", img: imgComunidad, chip: "Global", title: "Comunidad", text: "Emprendedores implementando lo mismo que tú." },
];

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
      {/* 1. Hero editorial (NeoVision): blanco, foto B/N de cuerpo entero, titular gigante */}
      <section className="relative overflow-hidden bg-background">
        <img src={heroImg} alt="Retrato editorial en blanco y negro" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[78%_center] grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent md:via-background/30" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-h-[1100px] max-w-7xl flex-col justify-end px-5 pb-14 pt-24">
          <span className="pill kinetic-word w-fit"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Protocolo Hack · Héctor Galensky</span>
          <h1 className="display mt-6 max-w-5xl text-[2.3rem] sm:text-6xl lg:text-[5.4rem]">
            <Kinetic text="Tres habilidades que" />
            <Kinetic text="cambiarán" delay={0.6} className="serif-accent text-primary" />
            <br />
            <Kinetic text="tu forma de" delay={1.1} />
            <Kinetic text="pensar," delay={1.5} className="serif-accent text-primary" />
            <Kinetic text="vender" delay={1.8} className="serif-accent text-primary" />
            <br />
            <Kinetic text="y hacer" delay={2.2} />
            <Kinetic text="negocios." delay={2.5} className="serif-accent text-primary" />
          </h1>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="kinetic-word max-w-md text-base text-muted-foreground md:text-lg" style={{ animationDelay: "3s" }}>
              Aprende inteligencia artificial, neuroventas y estrategias digitales. Descubre herramientas, mentorías y soluciones para llevar tu negocio al siguiente nivel.
            </p>
            <div className="kinetic-word flex flex-wrap gap-3" style={{ animationDelay: "3.2s" }}>
              <Link to="/academia" className="pill-solid">Explorar academia <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/marketplace" className="pill px-5 py-2.5 text-sm hover:bg-foreground/5">Descubrir herramientas</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque negro editorial intercalado */}
      <section className="dark-island">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
          <h2 className="display text-5xl md:text-7xl">Conocimiento <br />que se <span className="serif-accent text-primary">implementa.</span></h2>
          <div className="flex flex-wrap gap-2">
            {["Inteligencia artificial", "Neuroventas", "Automatización", "Mentorías 1:1"].map((t) => <span key={t} className="pill">{t}</span>)}
          </div>
        </div>
      </section>

      {/* 2. Tres tarjetas showcase (estilo Crypto Vault) */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Head kicker="El ecosistema" title="Aprende, implementa y" accent="escala." />
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} className="showcase group flex aspect-[4/5] flex-col justify-between p-6">
              <img src={f.img} alt={f.title} loading="lazy" width={816} height={816} className="showcase-img" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <span className="pill relative z-10 w-fit">{f.chip}</span>
              <div className="relative z-10 text-center">
                <p className="display text-3xl">{f.title}</p>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm text-foreground/70">{f.text}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ECOSYSTEM.filter((e) => !["/academia", "/marketplace", "/comunidad"].includes(e.to)).map(({ to, icon: Icon, title }) => (
            <Link key={to} to={to} className="group flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/50">
              <Icon className="h-4 w-4 text-primary" /> <span className="flex-1">{title}</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Cursos */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <Head kicker="Academia" title="Cursos" accent="destacados" to="/academia" link="Ver academia" />
        <div className="grid gap-4 md:grid-cols-3">
          {(courses.length ? courses : [{ id: "x", title: "Nuevos cursos muy pronto", description: "", thumbnail_url: null }]).map((c: any) => (
            <Link key={c.id} to="/academia" className="group">
              <div className="showcase aspect-video">
                {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.title} loading="lazy" className="showcase-img opacity-100" /> : <img src={imgAcademia} alt="" loading="lazy" className="showcase-img" />}
                <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-foreground text-background"><Play className="h-4 w-4 fill-current" /></span>
              </div>
              <p className="mt-4 font-heading text-lg font-semibold line-clamp-1">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Herramientas — editorial serif */}
      <section className="px-3 md:px-5">
        <div className="showcase grain p-8 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <div>
              <span className="pill">Marketplace</span>
              <h2 className="serif-display mt-6 text-5xl md:text-7xl">Tu negocio, <br /><span className="text-primary">potenciado.</span></h2>
              <p className="mt-4 max-w-sm text-foreground/60">Plugins y herramientas con IA para vender más con menos esfuerzo.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {TOOLS.map((t) => (
                <Link key={t.name} to="/marketplace" className="group rounded-3xl border border-foreground/10 bg-background/40 p-5 backdrop-blur-md transition-colors hover:border-primary/50">
                  <span className="pill">{t.tag}</span>
                  <p className="mt-8 font-heading text-lg font-semibold leading-tight">{t.name}</p>
                  <p className="mt-1 text-xs text-foreground/60">{t.text}</p>
                  <p className="mt-5 flex items-center justify-between font-heading font-semibold">{t.price} <ArrowUpRight className="h-4 w-4 text-primary" /></p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial split: foto B/N + titular */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2">
        <img src={editorialImg} alt="Emprendedora en blanco y negro" loading="lazy" width={1088} height={1440} className="aspect-[3/4] w-full object-cover grayscale" />
        <div>
          <span className="pill">Mentorías</span>
          <h2 className="display mt-6 text-5xl md:text-7xl">Ejecuta con <span className="serif-accent text-primary">claridad.</span></h2>
          <p className="mt-5 max-w-md text-muted-foreground">Trabaja directo con Héctor Galensky para destrabar tu negocio.</p>
          <Link to="/mentorias" className="pill-solid mt-8">Ver mentorías <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* 5. Mentorías */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Head kicker="Mentorías" title="Acompañamiento" accent="personal" to="/mentorias" link="Ver mentorías" />
        <div className="grid gap-4 md:grid-cols-3">
          {MENTORSHIPS.map((m, i) => (
            <Link key={m.name} to="/mentorias" className="group rounded-[2rem] border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/50">
              <div className="flex items-center justify-between">
                <span className="pill">{m.format}</span>
                <span className="font-heading text-sm text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="mt-10 font-heading text-2xl font-semibold leading-tight">{m.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Lead Flow — bloque claro gigante */}
      <section className="px-3 md:px-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-8 text-background md:p-14">
          <p className="display pointer-events-none absolute -bottom-6 right-0 select-none text-[22vw] leading-none text-background/5 md:text-[14rem]">FLOW</p>
          <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Lead Flow CRM</span>
          <h2 className="display mt-6 max-w-3xl text-4xl md:text-6xl">Deja de perder clientes. <span className="serif-accent text-primary">Ordena tus ventas.</span></h2>
          <p className="mt-4 max-w-xl opacity-70">El CRM para captar, seguir y cerrar oportunidades. Planes desde emprendedores hasta empresas.</p>
          <div className="relative mt-8 flex flex-wrap gap-2">
            {LEADFLOW_PLANS.map((p) => <span key={p.name} className="rounded-full border border-background/20 px-4 py-1.5 text-sm">{p.name}</span>)}
          </div>
          <Link to="/lead-flow" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]">
            Ver planes <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 7. Conferencias */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Head kicker="Empresas" title="Conferencias" accent="empresariales" to="/conferencias" link="Solicitar conferencia" />
        <div className="divide-y divide-border border-y border-border">
          {CONFERENCES.map((c, i) => (
            <Link key={c.name} to="/conferencias" className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 py-7">
              <span className="font-heading text-sm text-muted-foreground">0{i + 1}</span>
              <div>
                <p className="display text-2xl transition-colors group-hover:text-primary md:text-4xl">{c.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors group-hover:bg-foreground group-hover:text-background">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8 + 9. Recursos y eventos */}
      <section className="mx-auto grid max-w-7xl gap-4 px-5 lg:grid-cols-2">
        {[
          { kicker: "Gratis", title: "Recursos", accent: "gratuitos", to: "/recursos", items: RESOURCES.map((r) => ({ name: r.name, meta: r.type })), Icon: Download },
          { kicker: "En vivo", title: "Próximos", accent: "eventos", to: "/eventos", items: EVENTS.map((e) => ({ name: e.name, meta: e.mode })), Icon: CalendarDays },
        ].map(({ kicker, title, accent, to, items, Icon }) => (
          <div key={to} className="showcase p-8">
            <span className="pill">{kicker}</span>
            <h3 className="display mt-5 text-3xl md:text-4xl">{title} <span className="serif-accent text-primary">{accent}</span></h3>
            <ul className="mt-6 space-y-2">
              {items.map((it) => (
                <li key={it.name}>
                  <Link to={to} className="flex items-center gap-3 rounded-full border border-foreground/10 bg-background/40 px-5 py-3 text-sm transition-colors hover:border-primary/50">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="flex-1">{it.name}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{it.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* 10. Comunidad */}
      <section className="mx-auto max-w-7xl px-5 py-24 text-center">
        <span className="pill">Comunidad</span>
        <h2 className="serif-display mx-auto mt-6 max-w-3xl text-6xl md:text-8xl">No escales <span className="text-primary">solo.</span></h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">Comparte avances, resuelve dudas y conecta con emprendedores que están implementando lo mismo que tú.</p>
        <Link to="/comunidad" className="pill-solid mt-8">Unirme a la comunidad <ArrowRight className="h-4 w-4" /></Link>
      </section>

      {/* 11. FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="display text-4xl md:text-5xl">Preguntas <span className="serif-accent text-primary">frecuentes</span></h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left font-heading text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 12. CTA */}
      <section className="px-3 md:px-5">
        <div className="showcase grain px-6 py-20 text-center md:py-28">
          <img src={heroImg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="relative">
            <h2 className="display text-5xl md:text-8xl">Aprende. Implementa. <br /><span className="serif-accent text-primary">Escala.</span></h2>
            <p className="mx-auto mt-5 max-w-lg text-foreground/70">Todo en un solo ecosistema. Empieza gratis hoy.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/login" className="pill-solid">Crear mi cuenta <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/recursos" className="pill px-5 py-2.5 text-sm hover:bg-foreground/10">Ver recursos gratis</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
