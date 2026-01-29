import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Mail,
  MailOpen,
  User,
  Loader2,
  ArrowLeft,
  Users,
  Check,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useDirectMessages, DirectMessage } from "@/hooks/useDirectMessages";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const AdminMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, students, isLoading, sendMessage, markAsRead, deleteMessage, unreadCount } =
    useDirectMessages();

  const [searchTerm, setSearchTerm] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState("");
  const [recipientPopoverOpen, setRecipientPopoverOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null);
  const [showConfirmMassMessage, setShowConfirmMassMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<DirectMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!recipientSearchTerm) return students;
    return students.filter((student) =>
      student.full_name?.toLowerCase().startsWith(recipientSearchTerm.toLowerCase())
    );
  }, [students, recipientSearchTerm]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.recipient_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    const recipients = sendToAll 
      ? students.map(s => s.user_id) 
      : selectedStudents;
    
    if (recipients.length === 0 || !content.trim()) return;

    // Show confirmation for mass messages
    if (sendToAll && students.length > 1) {
      setShowConfirmMassMessage(true);
      return;
    }

    await executeSendMessage(recipients);
  };

  const executeSendMessage = async (recipients: string[]) => {
    setIsSending(true);
    setShowConfirmMassMessage(false);
    
    // Send message to each recipient
    for (const recipientId of recipients) {
      await sendMessage(recipientId, subject, content);
    }
    
    setIsSending(false);
    setShowComposeModal(false);
    setSelectedStudents([]);
    setSendToAll(false);
    setRecipientSearchTerm("");
    setSubject("");
    setContent("");
  };

  const handleOpenMessage = async (message: DirectMessage) => {
    setSelectedMessage(message);
    if (message.recipient_id === user?.id && !message.is_read) {
      await markAsRead(message.id);
    }
  };

  const handleReply = (message: DirectMessage) => {
    const replyTo = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
    setSelectedStudents([replyTo]);
    setSendToAll(false);
    setSubject(`Re: ${message.subject || "Sin asunto"}`);
    setSelectedMessage(null);
    setShowComposeModal(true);
  };

  const toggleStudentSelection = (userId: string) => {
    setSendToAll(false);
    setSelectedStudents(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSendToAll(true);
    setSelectedStudents([]);
    setRecipientPopoverOpen(false);
  };

  const getRecipientLabel = () => {
    if (sendToAll) return `Todos los estudiantes (${students.length})`;
    if (selectedStudents.length === 0) return "Selecciona destinatarios";
    if (selectedStudents.length === 1) {
      const student = students.find(s => s.user_id === selectedStudents[0]);
      return student?.full_name || "1 estudiante";
    }
    return `${selectedStudents.length} estudiantes seleccionados`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-heading font-bold">Mensajes</h1>
                  <p className="text-sm text-muted-foreground">
                    Comunicación directa con estudiantes
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <div className="text-sm text-muted-foreground">Estudiantes</div>
                  </div>
                </div>
              </HolographicCard>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <GlassInput
                placeholder="Buscar mensajes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Messages List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <HolographicCard className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                <p className="text-muted-foreground mb-4">
                  Envía un mensaje a tus estudiantes para comenzar
                </p>
                <NeonButton onClick={() => setShowComposeModal(true)}>
                  <Send className="w-4 h-4" />
                  Enviar Primer Mensaje
                </NeonButton>
              </HolographicCard>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((message) => {
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-primary-foreground">
                            {otherParty?.full_name?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">
                              {otherParty?.full_name || "Usuario"}
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
                Envía un mensaje directo a un estudiante
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destinatario</label>
                <Popover open={recipientPopoverOpen} onOpenChange={setRecipientPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={recipientPopoverOpen}
                      className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      {getRecipientLabel()}
                      <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar por nombre..." 
                        value={recipientSearchTerm}
                        onValueChange={setRecipientSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No se encontraron estudiantes.</CommandEmpty>
                        <CommandGroup heading="Opciones">
                          <CommandItem
                            onSelect={handleSelectAll}
                            className="cursor-pointer"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <span className="font-medium">Enviar a todos</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              ({students.length} estudiantes)
                            </span>
                            {sendToAll && <Check className="ml-2 h-4 w-4 text-primary" />}
                          </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Estudiantes">
                          {filteredStudents.map((student) => (
                            <CommandItem
                              key={student.user_id}
                              onSelect={() => toggleStudentSelection(student.user_id)}
                              className="cursor-pointer"
                            >
                              <div className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                selectedStudents.includes(student.user_id)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50"
                              )}>
                                {selectedStudents.includes(student.user_id) && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <span>{student.full_name || `Usuario ${student.user_id.slice(0, 8)}`}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                disabled={(!sendToAll && selectedStudents.length === 0) || !content.trim() || isSending}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="font-bold text-primary-foreground">
                        {(selectedMessage.sender_id === user?.id
                          ? selectedMessage.recipient_profile
                          : selectedMessage.sender_profile
                        )?.full_name?.[0]?.toUpperCase() || "?"}
                      </span>
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
                        )?.full_name || "Usuario"}
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
                      onClick={() => {
                        setMessageToDelete(selectedMessage);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-destructive hover:bg-destructive/10"
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

        {/* Confirm Mass Message Modal */}
        <Dialog open={showConfirmMassMessage} onOpenChange={setShowConfirmMassMessage}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <DialogTitle>Confirmar envío masivo</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Estás a punto de enviar un mensaje a <strong className="text-foreground">{students.length} estudiantes</strong>.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium mb-1">{subject || "Sin asunto"}</p>
                <p className="text-xs text-muted-foreground line-clamp-3">{content}</p>
              </div>
            </div>

            <DialogFooter>
              <NeonButton variant="ghost" onClick={() => setShowConfirmMassMessage(false)}>
                Cancelar
              </NeonButton>
              <NeonButton
                variant="default"
                onClick={() => executeSendMessage(students.map(s => s.user_id))}
                disabled={isSending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar a todos ({students.length})
                  </>
                )}
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <DialogTitle>Eliminar mensaje</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro que deseas eliminar este mensaje?
              </p>
              {messageToDelete && (
                <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm font-medium mb-1">{messageToDelete.subject || "Sin asunto"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{messageToDelete.content}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <NeonButton variant="ghost" onClick={() => {
                setShowDeleteConfirm(false);
                setMessageToDelete(null);
              }}>
                Cancelar
              </NeonButton>
              <NeonButton
                variant="default"
                onClick={async () => {
                  if (!messageToDelete) return;
                  setIsDeleting(true);
                  await deleteMessage(messageToDelete.id);
                  setIsDeleting(false);
                  setShowDeleteConfirm(false);
                  setMessageToDelete(null);
                  setSelectedMessage(null);
                }}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminMessagesPage;
