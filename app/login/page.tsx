import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Entrar a Protocolo Hack</CardTitle>
          <CardDescription>
            Escribí tu correo y te mandamos un enlace para entrar. Sin contraseñas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await signIn("resend", {
                email: formData.get("email"),
                redirectTo: callbackUrl || "/academia",
              });
            }}
            className="flex flex-col gap-3"
          >
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" required placeholder="tu@correo.com" />
            <Button type="submit" className="mt-2">
              Enviarme el enlace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
