import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/current-member";

const adminLinks = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/miembros", label: "Miembros" },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/recursos", label: "Recursos" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/ofertas", label: "Ofertas" },
  { href: "/admin/crm", label: "Puente CRM" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-1 text-sm">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
