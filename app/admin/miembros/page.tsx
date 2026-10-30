import { Collections } from "@/lib/db";
import { inviteMember, setMemberRole, setMemberStatus } from "@/lib/actions/members";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminMembersPage() {
  const members = await Collections.members();
  const all = await members.find().sort({ createdAt: -1 }).toArray();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Miembros</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitar a alguien</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteMember} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Opcional" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" />
            </div>
            <Button type="submit">Invitar</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Entra directo, sin aprobación. Le llega el enlace de acceso por correo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.map((member) => (
                <TableRow key={String(member._id)}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === "active" ? "default" : "destructive"}>
                      {member.status === "active" ? "activo" : "deshabilitado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {member.crmLeadId ? `lead ${member.crmLeadId.slice(0, 8)}…` : "—"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <form action={setMemberRole}>
                      <input type="hidden" name="memberId" value={String(member._id)} />
                      <input
                        type="hidden"
                        name="role"
                        value={member.role === "super_admin" ? "miembro" : "super_admin"}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        {member.role === "super_admin" ? "Quitar admin" : "Hacer admin"}
                      </Button>
                    </form>
                    <form action={setMemberStatus}>
                      <input type="hidden" name="memberId" value={String(member._id)} />
                      <input
                        type="hidden"
                        name="status"
                        value={member.status === "active" ? "disabled" : "active"}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        {member.status === "active" ? "Deshabilitar" : "Habilitar"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
