import { Collections } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [members, courses, resources, events, outbox] = await Promise.all([
    Collections.members(),
    Collections.courses(),
    Collections.resources(),
    Collections.events(),
    Collections.crmOutbox(),
  ]);

  const [memberCount, courseCount, resourceCount, eventCount, pendingCrm] = await Promise.all([
    members.countDocuments(),
    courses.countDocuments(),
    resources.countDocuments(),
    events.countDocuments(),
    outbox.countDocuments({ status: { $in: ["pending", "failed"] } }),
  ]);

  const stats = [
    { label: "Miembros", value: memberCount },
    { label: "Cursos", value: courseCount },
    { label: "Recursos", value: resourceCount },
    { label: "Eventos", value: eventCount },
    { label: "Pendientes para el CRM", value: pendingCrm },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Resumen</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{stat.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
