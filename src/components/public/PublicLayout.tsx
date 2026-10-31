import { useState, ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/academia", label: "Academia" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/mentorias", label: "Mentorías" },
  { to: "/lead-flow", label: "Lead Flow" },
  { to: "/conferencias", label: "Conferencias" },
  { to: "/recursos", label: "Recursos gratis" },
  { to: "/comunidad", label: "Comunidad" },
  { to: "/eventos", label: "Eventos" },
];

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Link to="/" className="font-heading text-lg font-bold tracking-tight">
            PROTOCOLO<span className="text-primary">HACK</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-secondary text-foreground"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/producer">Administración</Link>
              </Button>
            )}
            <Button asChild size="sm" className="rounded-full">
              <Link to={user ? "/dashboard" : "/login"}>{user ? "Mi cuenta" : "Entrar"}</Link>
            </Button>
            <button
              aria-label="Abrir menú"
              className="xl:hidden rounded-full p-2 hover:bg-secondary"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="xl:hidden border-t border-border px-5 py-4 grid grid-cols-2 gap-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-card px-4 py-3 text-sm hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/producer" className="rounded-xl bg-card px-4 py-3 text-sm text-primary">
                Administración
              </Link>
            )}
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

export const PageHero = ({ kicker, title, accent, text }: { kicker: string; title: string; accent?: string; text: string }) => (
  <section className="mx-auto max-w-7xl px-5 pt-16 pb-10 md:pt-24">
    <p className="text-xs uppercase tracking-[0.2em] text-primary">{kicker}</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] md:text-6xl">
      {title} {accent && <span className="serif-accent text-primary">{accent}</span>}
    </h1>
    <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{text}</p>
  </section>
);
