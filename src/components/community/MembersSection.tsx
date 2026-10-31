import React, { useState } from "react";
import { UserPlus, Users, Check, X, MessageSquare, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { levelName, type MemberRow } from "@/hooks/useCommunityModules";

interface Props {
  members: MemberRow[];
  incoming: { id: string; from_user_id: string; message: string }[];
  loading: boolean;
  userId?: string;
  connect: (toUserId: string, message: string) => Promise<void>;
  respond: (connectionId: string, accept: boolean) => Promise<void>;
  nameFor: (id: string) => string;
}

export const MembersSection: React.FC<Props> = ({
  members,
  incoming,
  loading,
  userId,
  connect,
  respond,
  nameFor,
}) => {
  const [connectFor, setConnectFor] = useState<MemberRow | null>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  const visible = members.filter((m) =>
    m.full_name.toLowerCase().includes(query.toLowerCase())
  );

  const handleConnect = async () => {
    if (!connectFor) return;
    await connect(connectFor.user_id, message);
    setConnectFor(null);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="dark-island rounded-[2rem] px-6 py-4">
          <p className="display text-xl md:text-2xl">
            Miembros <span className="serif-accent text-primary normal-case">del curso</span>
          </p>
          <p className="text-xs uppercase tracking-widest opacity-70 mt-1">
            Conecta con otros emprendedores de tu programa
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre"
          className="h-10 w-full sm:w-56 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
        />
      </div>

      {incoming.length > 0 && (
        <div className="rounded-[2rem] bg-secondary p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Solicitudes de conexión
          </p>
          <div className="space-y-3">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 flex-wrap rounded-[1.5rem] bg-background p-4"
              >
                <div>
                  <p className="font-semibold text-sm">{nameFor(req.from_user_id)}</p>
                  {req.message && (
                    <p className="text-xs text-muted-foreground mt-1">{req.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-full gap-1.5"
                    onClick={() => respond(req.id, true)}
                  >
                    <Check className="w-3.5 h-3.5" /> Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5"
                    onClick={() => respond(req.id, false)}
                  >
                    <X className="w-3.5 h-3.5" /> Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[2rem] bg-secondary p-5 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-[2rem] bg-secondary p-10 text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-heading font-semibold mb-1">
            {members.length === 0 ? "Eres el único miembro del curso" : "Nadie coincide con tu búsqueda"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {members.length === 0
              ? "Cuando entren más personas a este curso, las verás aquí."
              : "Prueba con otro nombre."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible.map((m) => (
            <div key={m.user_id} className="rounded-[2rem] bg-secondary p-5">
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={m.avatar_url || ""} />
                  <AvatarFallback>{m.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold truncate uppercase">{m.full_name}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    <Crown className="w-3 h-3 inline mr-1" />
                    {levelName(m.total_xp)} · {m.total_xp} pts
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {m.connection_status === "accepted" ? (
                  <span className="pill pill-solid inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Conectados
                  </span>
                ) : m.connection_status === "pending" ? (
                  <span className="pill">Solicitud enviada</span>
                ) : m.connection_status === "declined" ? (
                  <span className="pill">No disponible</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5"
                    onClick={() => {
                      setConnectFor(m);
                      setMessage("");
                    }}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Conectar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!connectFor} onOpenChange={(o) => !o && setConnectFor(null)}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">
              Conectar con {connectFor?.full_name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Preséntate en una o dos frases"
          />
          <Button className="w-full rounded-full gap-2" onClick={handleConnect}>
            <MessageSquare className="w-4 h-4" /> Enviar solicitud
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
