import Link from "next/link";
import { Collections } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MentorshipsPage() {
  const offersCol = await Collections.offers();
  const offers = await offersCol.find({ kind: "mentorship", active: true }).toArray();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Mentorías</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Comprás el cupo acá y coordinamos el horario por correo. El agendamiento con
        calendario propio todavía no está — queda anotado como pendiente.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {offers.map((offer) => (
          <Card key={String(offer._id)}>
            <CardHeader>
              <CardTitle className="text-base">{offer.title}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {(offer.priceCents / 100).toFixed(2)} {offer.currency}
              </p>
              <Button asChild className="mt-3 w-full">
                <Link href="/marketplace">Comprar en el marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {offers.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay mentorías publicadas.
          </p>
        )}
      </div>
    </div>
  );
}
