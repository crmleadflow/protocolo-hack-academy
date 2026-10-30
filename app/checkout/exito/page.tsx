import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Card>
        <CardHeader>
          <CardTitle>¡Gracias por tu compra!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <p>Ya la registramos. Si era un curso, lo vas a ver en tu cuenta.</p>
          <Button asChild>
            <Link href="/cuenta">Ir a mi cuenta</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
