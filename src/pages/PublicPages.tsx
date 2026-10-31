import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Check, ArrowRight, Download, CalendarDays, MessagesSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout, PageHero } from "@/components/public/PublicLayout";
import { RequestForm } from "@/components/public/RequestForm";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/pages/CommercePages";
import { cart, useCart } from "@/lib/cart";
import { MENTORSHIPS, LEADFLOW_PLANS, CONFERENCES, RESOURCES, EVENTS } from "@/components/public/content";

const Grid = ({ children }: { children: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-5 grid gap-4 md:grid-cols-3">{children}</section>
);
const Box = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-3xl border border-border bg-card p-6 ${className}`}>{children}</div>
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
      <PageHero kicker="Academia" title="Aprende lo que" accent="sí se implementa." text="Cursos y rutas de aprendizaje en inteligencia artificial, neuroventas y estrategia digital, con seguimiento de tu progreso." />
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <Grid>
          {data.map((c) => (
            <Link key={c.id} to={user ? "/catalog" : "/login"} className="group rounded-3xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <div className="aspect-video overflow-hidden rounded-2xl bg-secondary">
                {c.thumbnail_url && <img src={c.thumbnail_url} alt={c.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
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
  const { data = [], isLoading } = useCatalog();
  const items = useCart();
  return (
    <PublicLayout>
      <PageHero kicker="Marketplace" title="Herramientas para" accent="vender más." text="Cursos y herramientas del ecosistema Protocolo Hack." />
      <div className="mx-auto mb-6 flex max-w-7xl justify-end px-5">
        <Button asChild variant="outline" className="rounded-full"><Link to="/carrito"><ShoppingBag className="mr-2 h-4 w-4" />Carrito ({items.length})</Link></Button>
      </div>
      {isLoading ? <Loader2 className="mx-auto animate-spin" /> : (
        <Grid>
          {data.map((t) => {
            const inCart = items.some((i) => i.type === t.type && i.id === t.id);
            return (
              <Box key={t.type + t.id} className="flex flex-col">
                {t.image && <img src={t.image} alt={t.title} className="mb-5 aspect-video w-full rounded-2xl object-cover" />}
                <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs">{t.type === "program" ? "Curso" : "Herramienta"}</span>
                <p className="mt-4 font-heading text-xl font-semibold">{t.title}</p>
                <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">{t.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <p className="font-heading text-lg font-semibold">{t.price > 0 ? `USD ${t.price}` : "Incluida"}</p>
                  <Button size="sm" className="rounded-full" variant={inCart ? "outline" : "default"} disabled={inCart || t.price <= 0} onClick={() => cart.add({ type: t.type, id: t.id })}>
                    {inCart ? "En el carrito" : t.price > 0 ? "Agregar" : "Con tu programa"}
                  </Button>
                </div>
              </Box>
            );
          })}
        </Grid>
      )}
    </PublicLayout>
  );
};

export const MentoriasPage = () => (
  <PublicLayout>
    <PageHero kicker="Mentorías" title="Trabaja directo con" accent="Héctor Galensky." text="Sesiones individuales y grupales para destrabar tu negocio y ejecutar con claridad." />
    <TwoCol
      left={<div className="grid gap-4">{MENTORSHIPS.map((m) => (
        <Box key={m.name}><p className="text-xs text-primary">{m.format}</p><p className="mt-2 font-heading text-xl font-semibold">{m.name}</p><p className="mt-1 text-sm text-muted-foreground">{m.text}</p></Box>
      ))}</div>}
      right={<RequestForm type="mentoria" title="Reserva tu mentoría" cta="Quiero una mentoría" />}
    />
  </PublicLayout>
);

export const LeadFlowPage = () => (
  <PublicLayout>
    <PageHero kicker="Lead Flow" title="Tu CRM para" accent="cerrar más ventas." text="Capta, organiza y da seguimiento a cada oportunidad comercial desde un solo lugar." />
    <Grid>
      {LEADFLOW_PLANS.map((p) => (
        <Box key={p.name} className={p.featured ? "border-primary" : ""}>
          {p.featured && <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Más elegido</span>}
          <p className="mt-4 font-heading text-2xl font-semibold">{p.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
          <ul className="mt-6 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul>
          <Button asChild variant={p.featured ? "default" : "outline"} className="mt-6 w-full rounded-full"><a href="#leadflow-form">Solicitar {p.name}</a></Button>
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
        <Box key={c.name}><p className="font-heading text-xl font-semibold">{c.name}</p><p className="mt-1 text-sm text-muted-foreground">{c.text}</p></Box>
      ))}</div>}
      right={<RequestForm type="conferencia" title="Solicita una conferencia" showCompany cta="Pedir cotización" />}
    />
  </PublicLayout>
);

export const RecursosPage = () => (
  <PublicLayout>
    <PageHero kicker="Recursos gratis" title="Empieza hoy," accent="sin costo." text="Guías, plantillas y clases gratuitas. Déjanos tu correo y te enviamos el recurso." />
    <TwoCol
      left={<div className="grid gap-3 sm:grid-cols-2">{RESOURCES.map((r) => (
        <Box key={r.name}><Download className="h-5 w-5 text-primary" /><p className="mt-4 font-heading font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></Box>
      ))}</div>}
      right={<RequestForm type="recurso" title="Recibe los recursos gratis" cta="Enviármelos" />}
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
      <PageHero kicker="Comunidad" title="No escales" accent="solo." text="Un espacio para compartir avances, resolver dudas y conectar con emprendedores que están implementando." />
      <section className="mx-auto max-w-7xl px-5">
        <Box className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between p-8">
          <div className="flex items-center gap-4"><MessagesSquare className="h-8 w-8 text-primary" /><p className="font-heading text-xl font-semibold">Conversaciones por programa, con el Mentor IA respondiendo.</p></div>
          <Button asChild className="rounded-full"><Link to={user ? "/community" : "/login"}>{user ? "Entrar a la comunidad" : "Entrar con mi correo"}</Link></Button>
        </Box>
      </section>
    </PublicLayout>
  );
};
