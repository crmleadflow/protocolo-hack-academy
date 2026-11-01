import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Check, ArrowRight, Download, CalendarDays, MessagesSquare, Loader2, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout, PageHero } from "@/components/public/PublicLayout";
import { RequestForm } from "@/components/public/RequestForm";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/pages/CommercePages";
import { cart, useCart } from "@/lib/cart";
import { MENTORSHIPS, LEADFLOW_PLANS, CONFERENCES, RESOURCES, EVENTS, SEMINARS, CAPACITATIONS, BOOTCAMP_WEEKS } from "@/components/public/content";
import { NEURO_SCANNER_TOOL_ID, MENTOR_IA_TOOL_ID } from "@/hooks/useBonusAccess";
import academiaHeroImg from "@/assets/academia-hero-justdoit.webp";
import mascotaLeadFlowVideo from "@/assets/mascota-leadflow.webm";
import recursosHeroImg from "@/assets/recursos-hero-startcompanies.webp";
import herramientasHeroImg from "@/assets/herramientas-hero-iatools.webp";
import marketplaceCard1 from "@/assets/marketplace-card-1.jpg";
import marketplaceCard2 from "@/assets/marketplace-card-2.jpg";
import marketplaceCard3 from "@/assets/marketplace-card-3.jpg";
import marketplaceCard4 from "@/assets/marketplace-card-4.jpg";
import marketplaceShopCart from "@/assets/marketplace-shop-cart.webp";
import mentoriasHeroImg from "@/assets/mentorias-hero-creator.webp";
import comunidadHeroImg from "@/assets/comunidad-hero-persona.webp";

const Grid = ({ children }: { children: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-5 grid gap-4 md:grid-cols-3">{children}</section>
);
const Box = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[2rem] bg-secondary p-7 transition-transform hover:-translate-y-1 ${className}`}>{children}</div>
);
const TwoCol = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-5 grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">{left}{right}</section>
);

export const AcademiaPage = () => {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["public-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id,title,description,thumbnail_url")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  return (
    <PublicLayout>
      <PageHero kicker="Academia" title="Aprende lo que" accent="sí se implementa." text="Cursos y rutas de aprendizaje en inteligencia artificial, neuroventas y estrategia digital, con seguimiento de tu progreso." image={academiaHeroImg} />
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <Grid>
          {data.map((c) => (
            <Link key={c.id} to={user ? "/catalog" : "/login"} className="group rounded-[2rem] bg-secondary p-4 transition-transform hover:-translate-y-1">
              <div className="aspect-video overflow-hidden rounded-2xl bg-secondary">
                {c.thumbnail_url && <img src={c.thumbnail_url} alt={c.title} loading="lazy" className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform" />}
              </div>
              <p className="mt-4 px-2 font-heading text-lg font-semibold line-clamp-1">{c.title}</p>
              <p className="mt-1 px-2 pb-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            </Link>
          ))}
          {!data.length && <p className="text-muted-foreground">Pronto publicaremos nuevos cursos.</p>}
        </Grid>
      )}
      <div className="mt-10 text-center">
        <Button asChild size="lg" className="rounded-full"><Link to={user ? "/catalog" : "/login"}>{user ? "Ir a mis cursos" : "Entrar para empezar"} <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
      </div>
    </PublicLayout>
  );
};

export const MarketplacePage = () => {
  const items = useCart();
  return (
    <PublicLayout>
      <PageHero kicker="Marketplace" title="Encuentra lo que tu negocio" accent="necesita hoy." text="Cursos y herramientas del ecosistema Protocolo Hack." cards={[marketplaceCard1, marketplaceCard2, marketplaceCard3, marketplaceCard4]} />
      <div className="mx-auto mb-6 flex max-w-7xl justify-end px-5">
        <Button asChild variant="outline" className="rounded-full"><Link to="/carrito"><ShoppingBag className="mr-2 h-4 w-4" />Carrito ({items.length})</Link></Button>
      </div>
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-5 py-10 md:flex-row">
        <Link to="/marketplace/tienda" className="pill-solid order-2 md:order-1">Entrar a la tienda <ArrowRight className="ml-1 h-4 w-4" /></Link>
        <Link to="/marketplace/tienda" className="group order-1 block md:order-2">
          <img src={marketplaceShopCart} alt="Entrar a la tienda" className="w-full max-w-sm transition-transform duration-300 group-hover:-translate-y-2" />
        </Link>
      </section>
    </PublicLayout>
  );
};

const TIENDA_TABS = [
  { key: "cursos", label: "Cursos" },
  { key: "mentorias", label: "Mentorías" },
  { key: "recursos", label: "Recursos" },
  { key: "eventos", label: "Eventos" },
] as const;

type TiendaTab = (typeof TIENDA_TABS)[number]["key"];

type CatalogItem = { type: "program" | "tool"; id: string; title: string; description: string; image: string; price: number; currency: string };

const CatalogCard = ({ t, inCart }: { t: CatalogItem; inCart: boolean }) => (
  <Box className="flex flex-col">
    {t.image && <img src={t.image} alt={t.title} className="mb-5 aspect-video w-full rounded-2xl object-cover" />}
    <span className="w-fit rounded-full bg-background px-3 py-1 text-xs">{t.type === "program" ? "Curso" : "Herramienta"}</span>
    <p className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">{t.title}</p>
    <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">{t.description}</p>
    <div className="mt-6 flex items-center justify-between">
      <p className="font-heading text-lg font-semibold">{t.price > 0 ? `USD ${t.price}` : "Incluida"}</p>
      <Button size="sm" className="rounded-full" variant={inCart ? "outline" : "default"} disabled={inCart || t.price <= 0} onClick={() => cart.add({ type: t.type, id: t.id })}>
        {inCart ? "En el carrito" : t.price > 0 ? "Agregar" : "Con tu programa"}
      </Button>
    </div>
  </Box>
);

export const TiendaPage = () => {
  const { data = [], isLoading } = useCatalog();
  const items = useCart();
  const [tab, setTab] = useState<TiendaTab>("cursos");
  const cursos = data.filter((t) => t.type === "program");
  const herramientas = data.filter((t) => t.type === "tool");
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-5 pt-10 text-center">
        <p className="font-heading text-3xl font-bold uppercase tracking-tight md:text-5xl">Elige qué quieres ver</p>
        <div className="relative mt-8 inline-flex flex-wrap justify-center gap-1 rounded-full border border-foreground/10 bg-secondary p-1">
          {TIENDA_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                tab === t.key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <div key={tab} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {tab === "cursos" && (
          isLoading ? <Loader2 className="mx-auto mt-10 animate-spin" /> : (
            <Grid>
              {cursos.map((t) => <CatalogCard key={t.id} t={t} inCart={items.some((i) => i.type === t.type && i.id === t.id)} />)}
              {!cursos.length && <p className="text-muted-foreground">Pronto publicaremos nuevos cursos.</p>}
            </Grid>
          )
        )}
        {tab === "mentorias" && (
          <section className="mx-auto max-w-7xl px-5">
            <div className="grid gap-4 md:grid-cols-3">
              {MENTORSHIPS.map((m) => (
                <Box key={m.name}><p className="text-xs text-primary">{m.format}</p><p className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">{m.name}</p><p className="mt-1 text-sm text-muted-foreground">{m.text}</p></Box>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild className="rounded-full"><Link to="/mentorias">Reservar mentoría <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
          </section>
        )}
        {tab === "recursos" && (
          <section className="mx-auto max-w-7xl px-5">
            {!!herramientas.length && (
              <>
                <p className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight">Herramientas</p>
                <Grid>
                  {herramientas.map((t) => <CatalogCard key={t.id} t={t} inCart={items.some((i) => i.type === t.type && i.id === t.id)} />)}
                </Grid>
              </>
            )}
            <p className="mb-4 mt-10 font-heading text-lg font-semibold uppercase tracking-tight">Guías gratuitas</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {RESOURCES.map((r) => (
                <Box key={r.name}><Download className="h-5 w-5 text-primary" /><p className="mt-4 font-heading font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></Box>
              ))}
            </div>
          </section>
        )}
        {tab === "eventos" && (
          <section className="mx-auto max-w-7xl px-5">
            <div className="grid gap-3">
              {EVENTS.map((e) => (
                <Box key={e.name} className="flex items-center gap-4"><CalendarDays className="h-6 w-6 text-primary" /><div className="flex-1"><p className="font-heading font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.mode}</p></div><span className="text-xs text-muted-foreground">{e.date}</span></Box>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild className="rounded-full"><Link to="/eventos">Reservar mi lugar <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
};

export const MentoriasPage = () => (
  <PublicLayout>
    <PageHero kicker="Mentorías" title="Trabaja directo con" accent="Héctor Galensky." text="Sesiones individuales y grupales para destrabar tu negocio y ejecutar con claridad." image={mentoriasHeroImg} />
    <TwoCol
      left={<div className="grid gap-4">{MENTORSHIPS.map((m) => (
        <Box key={m.name}><p className="text-xs text-primary">{m.format}</p><p className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">{m.name}</p><p className="mt-1 text-sm text-muted-foreground">{m.text}</p></Box>
      ))}</div>}
      right={<RequestForm type="mentoria" title="Reserva tu mentoría" cta="Quiero una mentoría" />}
    />
  </PublicLayout>
);

export const LeadFlowPage = () => (
  <PublicLayout>
    <PageHero kicker="Lead Flow" title="Tu CRM para" accent="cerrar más ventas." text="Capta, organiza y da seguimiento a cada oportunidad comercial desde un solo lugar." video={mascotaLeadFlowVideo} />
    <Grid>
      {LEADFLOW_PLANS.map((p) => (
        <Box key={p.name} className={p.featured ? "dark-island bg-background text-foreground" : ""}>
          {p.featured && <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Más elegido</span>}
          <p className="mt-4 font-heading text-2xl font-semibold">{p.name}</p>
          <p className="mt-2 font-heading text-3xl font-bold">${p.price}<span className="text-sm font-normal text-muted-foreground"> USD/mes</span></p>
          <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
          <ul className="mt-6 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul>
          <Button asChild variant={p.featured ? "default" : "outline"} className="mt-6 w-full rounded-full"><a href="https://leadflowneurosophia.io/precios" target="_blank" rel="noopener noreferrer">Solicitar {p.name}</a></Button>
        </Box>
      ))}
    </Grid>
    <section id="leadflow-form" className="mx-auto mt-12 max-w-xl px-5">
      <RequestForm type="leadflow" title="Hablemos de tu plan Lead Flow" showCompany cta="Solicitar información" />
    </section>
  </PublicLayout>
);

export const ConferenciasPage = () => (
  <PublicLayout>
    <PageHero kicker="Conferencias" title="Formación que" accent="mueve equipos." text="Conferencias y capacitaciones empresariales sobre IA, ventas y transformación digital." />
    <TwoCol
      left={<div className="grid gap-4">{CONFERENCES.map((c) => (
        <Box key={c.name}><p className="font-heading text-xl font-bold uppercase tracking-tight">{c.name}</p><p className="mt-1 text-sm text-muted-foreground">{c.text}</p></Box>
      ))}</div>}
      right={<RequestForm type="conferencia" title="Solicita una conferencia" showCompany cta="Pedir cotización" />}
    />
  </PublicLayout>
);

export const RecursosPage = () => (
  <PublicLayout>
    <PageHero kicker="Recursos" title="Empieza hoy," accent="sin costo." text="Guías, plantillas y clases gratuitas. Déjanos tu correo y te enviamos el recurso." image={recursosHeroImg} />
    <TwoCol
      left={<div className="grid gap-3 sm:grid-cols-2">{RESOURCES.map((r) => (
        <Box key={r.name}><Download className="h-5 w-5 text-primary" /><p className="mt-4 font-heading font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></Box>
      ))}</div>}
      right={<RequestForm type="recurso" title="Recibe los recursos gratis" cta="Enviármelos" />}
    />
    <section className="mx-auto max-w-7xl px-5">
      <Box className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between p-8">
        <div className="flex items-center gap-4">
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <p className="font-heading text-xl font-bold uppercase tracking-tight">Herramientas</p>
            <p className="mt-1 text-sm text-muted-foreground">Neuro Analyzer Pro y Mi Mentor IA, disponibles dentro de tu cuenta.</p>
          </div>
        </div>
        <Button asChild className="rounded-full"><Link to="/herramientas">Ver herramientas <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
      </Box>
    </section>
  </PublicLayout>
);

const TOOL_LINKS: Record<string, { to: string; name: string }> = {
  [NEURO_SCANNER_TOOL_ID]: { to: "/neuro-scanner", name: "Neuro Analyzer Pro" },
  [MENTOR_IA_TOOL_ID]: { to: "/mentor", name: "Mi Mentor IA" },
};

export const HerramientasPage = () => {
  const { user } = useAuth();
  const { data = [], isLoading } = useCatalog();
  const tools = data.filter((t) => t.type === "tool");
  return (
    <PublicLayout>
      <PageHero kicker="Herramientas" title="El secreto no es magia," accent="son tres poderes." text="Tu caja de herramientas: inteligencia artificial, neuroventas e inteligencia emocional." image={herramientasHeroImg} />
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <Grid>
          {tools.map((t) => {
            const link = TOOL_LINKS[t.id];
            return (
              <Box key={t.id} className="flex flex-col">
                <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs">Herramienta</span>
                <p className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">{link?.name ?? t.title}</p>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.description}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="font-heading text-lg font-semibold">{t.price > 0 ? `USD ${t.price}` : "Con tu programa"}</p>
                  <Button asChild size="sm" className="rounded-full">
                    <Link to={user && link ? link.to : "/login"}>{user ? "Abrir" : "Entrar con Google"} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Box>
            );
          })}
          {!tools.length && <p className="text-muted-foreground">Pronto publicaremos nuevas herramientas.</p>}
        </Grid>
      )}
    </PublicLayout>
  );
};

export const SeminariosPage = () => (
  <PublicLayout>
    <PageHero kicker="Seminarios" title="Un tema, una sesión," accent="cero relleno." text="Sesiones intensas en vivo: entiendes el concepto y sales con acciones concretas para tu negocio." />
    <TwoCol
      left={<div className="grid gap-4">{SEMINARS.map((s) => (
        <Box key={s.name}><p className="text-xs text-primary">{s.mode}</p><p className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">{s.name}</p><p className="mt-1 text-sm text-muted-foreground">{s.text}</p></Box>
      ))}</div>}
      right={<RequestForm type="seminario" title="Reserva tu cupo" cta="Quiero mi cupo" />}
    />
  </PublicLayout>
);

export const CapacitacionesPage = () => (
  <PublicLayout>
    <PageHero kicker="Capacitaciones" title="Tu equipo," accent="al mismo nivel." text="Programas a medida para empresas: mismo estándar de conversación, mismas herramientas, mismos criterios." />
    <TwoCol
      left={<div className="grid gap-4">{CAPACITATIONS.map((c) => (
        <Box key={c.name}><p className="text-xs text-primary">{c.format}</p><p className="mt-2 font-heading text-xl font-bold uppercase tracking-tight">{c.name}</p><p className="mt-1 text-sm text-muted-foreground">{c.text}</p></Box>
      ))}</div>}
      right={<RequestForm type="capacitacion" title="Cuéntanos qué necesita tu equipo" showCompany cta="Solicitar propuesta" />}
    />
  </PublicLayout>
);

export const BootcampPage = () => (
  <PublicLayout>
    <PageHero kicker="Bootcamp" title="Cuatro semanas," accent="implementando." text="Un recorrido intensivo y guiado: de la idea al primer resultado, con acompañamiento cada semana." />
    <TwoCol
      left={<div className="grid gap-3">{BOOTCAMP_WEEKS.map((w) => (
        <Box key={w.week} className="flex items-start gap-4">
          <span className="pill shrink-0">{w.week}</span>
          <div className="flex-1">
            <p className="font-heading text-lg font-bold uppercase tracking-tight">{w.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
          </div>
        </Box>
      ))}</div>}
      right={<RequestForm type="bootcamp" title="Reserva tu cupo en el próximo bootcamp" cta="Quiero mi cupo" />}
    />
  </PublicLayout>
);

export const EventosPage = () => (
  <PublicLayout>
    <PageHero kicker="Eventos" title="Aprende" accent="en vivo." text="Webinars, clases abiertas y sesiones de preguntas y respuestas." />
    <TwoCol
      left={<div className="grid gap-3">{EVENTS.map((e) => (
        <Box key={e.name} className="flex items-center gap-4"><CalendarDays className="h-6 w-6 text-primary" /><div className="flex-1"><p className="font-heading font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.mode}</p></div><span className="text-xs text-muted-foreground">{e.date}</span></Box>
      ))}</div>}
      right={<RequestForm type="evento" title="Avísame del próximo evento" cta="Reservar mi lugar" />}
    />
  </PublicLayout>
);

export const ComunidadPublicPage = () => {
  const { user } = useAuth();
  return (
    <PublicLayout>
      <PageHero kicker="Comunidad" title="No escales" accent="solo." text="Un espacio para compartir avances, resolver dudas y conectar con emprendedores que están implementando." image={comunidadHeroImg} ctaLabel="Ir al Marketplace" ctaTo="/marketplace" />
      <section className="mx-auto max-w-7xl px-5">
        <Box className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between p-8">
          <div className="flex items-center gap-4"><MessagesSquare className="h-8 w-8 text-primary" /><p className="font-heading text-xl font-bold uppercase tracking-tight">Conversaciones por programa, con el Mentor IA respondiendo.</p></div>
          <Button asChild className="rounded-full"><Link to={user ? "/community" : "/login"}>{user ? "Entrar a la comunidad" : "Entrar con Google"}</Link></Button>
        </Box>
      </section>
    </PublicLayout>
  );
};
