import { Collections } from "@/lib/db";
import { createOffer, setOfferActive } from "@/lib/actions/offers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const kindLabels: Record<string, string> = {
  course: "Curso",
  mentorship: "Mentoría",
  plugin: "Plugin",
  crm_plan: "Plan de Lead Flow",
  speaking: "Charla / conferencia",
};

export default async function AdminOffersPage() {
  const [offersCol, coursesCol] = await Promise.all([Collections.offers(), Collections.courses()]);
  const offers = await offersCol.find().sort({ createdAt: -1 }).toArray();
  const courses = await coursesCol.find().toArray();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Ofertas (marketplace)</h1>
      <p className="text-sm text-muted-foreground">
        Cursos y mentorías pagan con Stripe/Wompi. Plugins, planes de Lead Flow y charlas
        no tienen checkout: el botón manda la intención de compra al CRM para que la
        cierres a mano.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva oferta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOffer} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required className="w-56" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" className="w-56" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="kind">Tipo</Label>
              <select id="kind" name="kind" className="h-9 rounded-md border bg-background px-2 text-sm">
                <option value="course">Curso</option>
                <option value="mentorship">Mentoría</option>
                <option value="plugin">Plugin</option>
                <option value="crm_plan">Plan de Lead Flow</option>
                <option value="speaking">Charla / conferencia</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="refId">Curso relacionado (si aplica)</Label>
              <select id="refId" name="refId" className="h-9 rounded-md border bg-background px-2 text-sm">
                <option value="">— Ninguno —</option>
                {courses.map((course) => (
                  <option key={String(course._id)} value={String(course._id)}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" name="price" type="text" placeholder="49.90" className="w-24" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                name="currency"
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
              </select>
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {offers.map((offer) => (
          <Card key={String(offer._id)}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{offer.title}</p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline">{kindLabels[offer.kind] || offer.kind}</Badge>
                  <Badge variant="secondary">
                    {(offer.priceCents / 100).toFixed(2)} {offer.currency}
                  </Badge>
                  <Badge variant={offer.active ? "default" : "secondary"}>
                    {offer.active ? "activa" : "pausada"}
                  </Badge>
                </div>
              </div>
              <form action={setOfferActive}>
                <input type="hidden" name="offerId" value={String(offer._id)} />
                <input type="hidden" name="active" value={(!offer.active).toString()} />
                <Button type="submit" size="sm" variant="outline">
                  {offer.active ? "Pausar" : "Activar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
