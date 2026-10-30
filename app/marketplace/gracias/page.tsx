import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MarketplaceThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ oferta?: string }>;
}) {
  const { oferta } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>¡Listo!</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Recibimos tu interés{oferta ? ` en "${oferta}"` : ""}. Pronto te contactamos.
        </CardContent>
      </Card>
    </div>
  );
}
