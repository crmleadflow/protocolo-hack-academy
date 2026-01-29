import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/glass-input";
import { useCommunityChat, ChatMessage } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityChatProps {
  programId: string;
  programTitle: string;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({
  programId,
  programTitle,
}) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useCommunityChat(programId);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    await sendMessage(newMessage);
    setNewMessage("");
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[500px] glass-card rounded-xl p-4">
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h3 className="font-heading font-semibold">
          Chat de {programTitle}
        </h3>
        <p className="text-xs text-muted-foreground">
          {messages.length} mensajes
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.user_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <GlassInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
        {message.author?.avatar_url ? (
          <img
            src={message.author.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-primary-foreground">
            {message.author?.full_name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={cn("max-w-[70%]", isOwn && "text-right")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {message.author?.full_name || "Usuario"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
        <div
          className={cn(
            "inline-block p-3 rounded-2xl text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "glass rounded-tl-md"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};
