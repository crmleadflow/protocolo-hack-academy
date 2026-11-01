import heroBw from "@/assets/home-hero-bw.jpg";
import editorialBw from "@/assets/editorial-bw-2.jpg";
import { useState, useEffect, ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/academia", label: "Academia" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/lead-flow", label: "Lead Flow" },
  { to: "/recursos", label: "Recursos" },
  { to: "/herramientas", label: "Herramientas" },
  { to: "/comunidad", label: "Comunidad" },
];

// Sub-secciones agrupadas dentro de Marketplace. Sin `to` = aún no existe la página.
export const MARKETPLACE_SUB: { to?: string; label: string }[] = [
  { to: "/mentorias", label: "Mentorías" },
  { to: "/conferencias", label: "Conferencias" },
  { to: "/seminarios", label: "Seminarios" },
  { to: "/capacitaciones", label: "Capacitaciones" },
  { to: "/eventos", label: "Eventos" },
  { to: "/bootcamp", label: "Bootcamp" },
];

// Lo que hay debajo de Herramientas.
export const TOOLS_SUB = [
  { to: "/neuro-scanner", label: "Neuro Analyzer Pro" },
  { to: "/mentor", label: "Mi Mentor IA" },
];

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const close = () => setOpen(false);
  const item = "block rounded-xl px-4 py-3 text-sm hover:bg-secondary";
  const location = useLocation();

  // Grupos desplegables del menú
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Abre el grupo de la pantalla en la que estás
  useEffect(() => {
    const next: Record<string, boolean> = {};
    const inList = (list: { to?: string }[]) =>
      list.some((s) => s.to && location.pathname.startsWith(s.to));
    if (location.pathname.startsWith("/marketplace") || inList(MARKETPLACE_SUB)) {
      next.marketplace = true;
    }
    if (location.pathname.startsWith("/herramientas") || inList(TOOLS_SUB)) {
      next.herramientas = true;
    }
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [location.pathname]);

  const groupHead = (key: string, to: string, label: string) => {
    const isOpen = !!openGroups[key];
    return (
      <div className="flex items-center gap-1">
        <NavLink
          to={to}
          onClick={close}
          className={({ isActive }) =>
            cn(
              item,
              "flex-1 font-heading font-bold uppercase tracking-wide",
              isActive && "bg-secondary"
            )
          }
        >
          {label}
        </NavLink>
        <button
          type="button"
          onClick={() => toggleGroup(key)}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Ocultar" : "Mostrar"} ${label}`}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm text-primary-foreground">PH</span>
            <span>protocolo<span className="serif-accent text-primary text-xl">hack</span></span>
          </Link>
          <div className="flex items-center gap-2">
            {!user && <Link to="/login" className="pill-solid px-4 py-2">Entrar</Link>}
            <button
              aria-label="Abrir menú"
              className="rounded-full p-2 hover:bg-secondary"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border bg-background px-5 py-4 max-h-[80vh] overflow-y-auto">
            <div className="mx-auto max-w-7xl grid gap-1 md:grid-cols-3 md:gap-6">
              <div>
                {NAV.filter((n) => n.to !== "/marketplace" && n.to !== "/herramientas").map((n) => (
                  <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={close}
                    className={({ isActive }) => cn(item, isActive && "bg-secondary font-medium")}>
                    {n.label}
                  </NavLink>
                ))}
              </div>
              <div className="md:col-span-2">
                {groupHead("marketplace", "/marketplace", "Marketplace")}
                {openGroups["marketplace"] && (
                  <div className="grid grid-cols-2 gap-1 pl-2 border-l-2 border-primary ml-4">
                    {MARKETPLACE_SUB.map((s) =>
                      s.to ? (
                        <Link key={s.label} to={s.to} onClick={close} className={item}>{s.label}</Link>
                      ) : (
                        <span key={s.label} className={cn(item, "text-muted-foreground cursor-default hover:bg-transparent")}>
                          {s.label} <span className="text-xs">· próximamente</span>
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                {groupHead("herramientas", "/herramientas", "Herramientas")}
                {openGroups["herramientas"] && (
                  <div className="grid grid-cols-2 gap-1 pl-2 border-l-2 border-primary ml-4">
                    {TOOLS_SUB.map((t) => (
                      <Link key={t.to} to={t.to} onClick={close} className={item}>{t.label}</Link>
                    ))}
                  </div>
                )}
              </div>
              {user && (
                <div className="md:col-span-3 border-t border-border pt-2 mt-2 flex flex-wrap gap-1">
                  <Link to="/dashboard" onClick={close} className={item}>Métricas</Link>
                  {isAdmin && <Link to="/producer" onClick={close} className={cn(item, "text-primary")}>Administración</Link>}
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-7xl px-5 py-12 grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-bold">
              PROTOCOLO<span className="text-primary">HACK</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Aprende, implementa y escala. Todo en un solo ecosistema. Por Héctor Galensky.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:col-span-2">
            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                {n.label} <ArrowUpRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
        <p className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Protocolo Hack</p>
      </footer>
    </div>
  );
};

const HERO_IMGS = [heroBw, editorialBw];

export const PageHero = ({ kicker, title, accent, text, image }: { kicker: string; title: string; accent?: string; text: string; image?: string }) => {
  const img = image ?? HERO_IMGS[kicker.length % HERO_IMGS.length];
  return (
    <>
      <section className="px-3 pt-3 md:px-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-secondary min-h-[70vh] grid md:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-end p-6 md:p-14 order-2 md:order-1">
            <span className="pill w-fit"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {kicker}</span>
            <h1 className="display mt-6 text-5xl md:text-6xl lg:text-8xl">
              {title} {accent && <span className="serif-accent text-primary">{accent}</span>}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{text}</p>
          </div>
          <div className="relative order-1 md:order-2 min-h-[40vh]">
            <img src={img} alt="" className={`absolute inset-0 h-full w-full object-cover ${image ? "" : "grayscale"}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent md:bg-gradient-to-r md:from-secondary md:via-transparent" />
          </div>
        </div>
      </section>
      <section className="px-3 pt-3 pb-12 md:px-5">
        <div className="dark-island rounded-[2rem] bg-background text-foreground px-6 py-10 md:px-14 md:py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <p className="display text-3xl md:text-5xl max-w-3xl">Aprende, implementa <span className="serif-accent text-primary">y escala.</span></p>
          <span className="pill w-fit">Protocolo Hack · {kicker}</span>
        </div>
      </section>
    </>
  );
};
