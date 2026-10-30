import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RevisaTuCorreoPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Revisá tu correo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Te mandamos un enlace para entrar. Abrilo desde el mismo dispositivo donde
          pediste el acceso.
        </CardContent>
      </Card>
    </div>
  );
}
