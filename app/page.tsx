import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCallLink } from "@/components/book-call-link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="flex flex-col items-start gap-6 py-12">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Bienvenido a Protocolo Hack
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          La comunidad y academia donde aprendés, te conectás y avanzás. Empezá gratis
          con nuestros recursos y cursos introductorios.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/recursos">Ver recursos gratis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/academia">Explorar la academia</Link>
          </Button>
          <BookCallLink />
        </div>
      </section>

      <section className="grid gap-4 py-8 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Academia</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cursos en video, por módulos, con seguimiento de tu progreso.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Eventos en vivo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Webinars y llamadas abiertas con el equipo de Protocolo Hack.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comunidad</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Un espacio para compartir avances, dudas y conexiones.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
