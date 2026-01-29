import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Mail,
  MailOpen,
  Loader2,
  ArrowLeft,
  Shield,
  Trash2,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDirectMessages, DirectMessage } from "@/hooks/useDirectMessages";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const StudentMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, admins, isLoading, sendMessage, markAsRead, deleteMessage, unreadCount } =
    useDirectMessages();

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<DirectMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSendMessage = async () => {
    if (!selectedAdmin || !content.trim()) return;

    setIsSending(true);
    const { error } = await sendMessage(selectedAdmin, subject, content);
    setIsSending(false);

    if (!error) {
      setShowComposeModal(false);
      setSelectedAdmin("");
      setSubject("");
      setContent("");
    }
  };

  const handleOpenMessage = async (message: DirectMessage) => {
    setSelectedMessage(message);
    if (message.recipient_id === user?.id && !message.is_read) {
      await markAsRead(message.id);
    }
  };

  const handleReply = (message: DirectMessage) => {
    const replyTo = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
    setSelectedAdmin(replyTo);
    setSubject(`Re: ${message.subject || "Sin asunto"}`);
    setSelectedMessage(null);
    setShowComposeModal(true);
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    await deleteMessage(messageToDelete.id);
    setIsDeleting(false);
    setMessageToDelete(null);
    setSelectedMessage(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-heading font-bold">Mensajes</h1>
                  <p className="text-sm text-muted-foreground">
                    Comunicación con administradores
                  </p>
                </div>
              </div>
              <NeonButton onClick={() => setShowComposeModal(true)}>
                <Send className="w-4 h-4" />
                Nuevo Mensaje
              </NeonButton>
            </div>
          </header>

          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{messages.length}</div>
                    <div className="text-sm text-muted-foreground">Total Mensajes</div>
                  </div>
                </div>
              </HolographicCard>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{unreadCount}</div>
                    <div className="text-sm text-muted-foreground">Sin Leer</div>
                  </div>
                </div>
              </HolographicCard>
            </div>

            {/* Messages List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <HolographicCard className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                <p className="text-muted-foreground mb-4">
                  Envía un mensaje al administrador si tienes alguna consulta
                </p>
                <NeonButton onClick={() => setShowComposeModal(true)}>
                  <Send className="w-4 h-4" />
                  Enviar Mensaje
                </NeonButton>
              </HolographicCard>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isSent = message.sender_id === user?.id;
                  const otherParty = isSent
                    ? message.recipient_profile
                    : message.sender_profile;

                  return (
                    <HolographicCard
                      key={message.id}
                      className={`p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                        !message.is_read && !isSent ? "border-l-4 border-l-primary" : ""
                      }`}
                      onClick={() => handleOpenMessage(message)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-secondary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">
                              {otherParty?.full_name || "Administrador"}
                            </span>
                            <Badge variant={isSent ? "outline" : "secondary"} className="text-xs">
                              {isSent ? "Enviado" : "Recibido"}
                            </Badge>
                            {!message.is_read && !isSent && (
                              <Badge className="text-xs">Nuevo</Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm mb-1">
                            {message.subject || "Sin asunto"}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                        {message.is_read || isSent ? (
                          <MailOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </HolographicCard>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Compose Modal */}
        <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Mensaje</DialogTitle>
              <DialogDescription>
                Envía un mensaje al administrador
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destinatario</label>
                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un administrador" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.user_id} value={admin.user_id}>
                        {admin.full_name || "Administrador"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Asunto</label>
                <GlassInput
                  placeholder="Asunto del mensaje"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <DialogFooter>
              <NeonButton variant="ghost" onClick={() => setShowComposeModal(false)}>
                Cancelar
              </NeonButton>
              <NeonButton
                onClick={handleSendMessage}
                disabled={!selectedAdmin || !content.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar
                  </>
                )}
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Message Modal */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-lg">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                      <Shield className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <DialogTitle className="text-left">
                        {selectedMessage.subject || "Sin asunto"}
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.sender_id === user?.id ? "Para: " : "De: "}
                        {(selectedMessage.sender_id === user?.id
                          ? selectedMessage.recipient_profile
                          : selectedMessage.sender_profile
                        )?.full_name || "Administrador"}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {formatDistanceToNow(new Date(selectedMessage.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <NeonButton variant="ghost" onClick={() => setSelectedMessage(null)}>
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </NeonButton>
                  <div className="flex gap-2">
                    <NeonButton 
                      variant="ghost" 
                      onClick={() => setMessageToDelete(selectedMessage)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </NeonButton>
                    <NeonButton onClick={() => handleReply(selectedMessage)}>
                      <Send className="w-4 h-4" />
                      Responder
                    </NeonButton>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El mensaje será eliminado permanentemente de tu bandeja.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteMessage} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
};

export default StudentMessagesPage;
