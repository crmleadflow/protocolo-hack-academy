import { Collections } from "@/lib/db";
import { retryOutbox } from "@/lib/actions/crm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminCrmPage() {
  const [outboxCol, membersCol] = await Promise.all([
    Collections.crmOutbox(),
    Collections.members(),
  ]);
  const items = await outboxCol.find().sort({ updatedAt: -1 }).limit(100).toArray();
  const memberIds = items.map((i) => i.memberId);
  const members = await membersCol.find({ _id: { $in: memberIds } }).toArray();
  const memberById = new Map(members.map((m) => [String(m._id), m]));

  const tokenConfigured = !!process.env.LEADFLOW_CRM_WEBHOOK_TOKEN;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Puente hacia Lead Flow CRM</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado</CardTitle>
          <CardDescription>
            {tokenConfigured
              ? "El token del CRM está configurado."
              : "Falta configurar LEADFLOW_CRM_WEBHOOK_TOKEN. Mientras tanto, todo queda pendiente y no se pierde."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={retryOutbox}>
            <Button type="submit">Reintentar envíos pendientes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Intentos</TableHead>
                <TableHead>Último error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const member = memberById.get(String(item.memberId));
                return (
                  <TableRow key={String(item._id)}>
                    <TableCell>{member ? `${member.name} (${member.email})` : "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "sent"
                            ? "default"
                            : item.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.attempts}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {item.lastError || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
