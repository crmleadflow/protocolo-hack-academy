import { Collections } from "@/lib/db";
import { requestOfferInfo } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Offer, OfferKind } from "@/types/models";

const sections: { kind: OfferKind; title: string; checkout: boolean }[] = [
  { kind: "course", title: "Cursos", checkout: true },
  { kind: "mentorship", title: "Mentorías", checkout: true },
  { kind: "plugin", title: "Plugins", checkout: false },
  { kind: "crm_plan", title: "Planes de Lead Flow CRM", checkout: false },
  { kind: "speaking", title: "Charlas y conferencias", checkout: false },
];

function formatPrice(offer: Offer): string {
  return `${(offer.priceCents / 100).toFixed(2)} ${offer.currency}`;
}

export default async function MarketplacePage() {
  const offersCol = await Collections.offers();
  const all = await offersCol.find({ active: true }).toArray();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Marketplace</h1>
      <p className="mt-2 text-muted-foreground">
        Cursos, mentorías, plugins, planes de Lead Flow CRM y charlas — todo en un solo
        lugar.
      </p>

      {sections.map((section) => {
        const offers = all.filter((o) => o.kind === section.kind);
        if (offers.length === 0) return null;
        return (
          <div key={section.kind} className="mt-8">
            <h2 className="text-lg font-medium">{section.title}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <Card key={String(offer._id)}>
                  <CardHeader>
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <CardDescription>{offer.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="font-semibold">{formatPrice(offer)}</p>
                    {section.checkout ? (
                      <form action="/api/checkout/stripe" method="POST">
                        <input type="hidden" name="offerId" value={String(offer._id)} />
                        <Button type="submit" className="w-full">
                          Comprar
                        </Button>
                      </form>
                    ) : (
                      <form action={requestOfferInfo} className="flex flex-col gap-2">
                        <input type="hidden" name="offerId" value={String(offer._id)} />
                        <Input name="name" placeholder="Tu nombre" required />
                        <Input name="email" type="email" placeholder="Tu correo" required />
                        <Input name="phone" placeholder="Teléfono (opcional)" />
                        <Button type="submit" variant="outline" className="w-full">
                          Quiero saber más
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {all.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Todavía no hay ofertas publicadas.
        </p>
      )}
    </div>
  );
}
