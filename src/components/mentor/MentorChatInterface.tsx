import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/glass-input";
import { useMentorChat, useMentorSettings } from "@/hooks/useMentor";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

interface MentorChatInterfaceProps {
  className?: string;
}

export const MentorChatInterface: React.FC<MentorChatInterfaceProps> = ({
  className,
}) => {
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useMentorSettings();
  const { messages, isLoading, sendMessage, clearConversation } = useMentorChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleCitationClick = (citation: any) => {
    if (citation.lesson_id) {
      // Navigate to the course player with timestamp
      const timestampParam = citation.timestamp ? `?t=${citation.timestamp}` : "";
      // We need to find the program ID from the lesson
      if (citation.program_id) {
        navigate(`/course/${citation.program_id}${timestampParam}`);
      }
    }
  };

  if (settingsLoading) {
    return (
      <div className={cn("glass-card rounded-xl p-6", className)}>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-[calc(100vh-200px)] min-h-[500px]", className)}>
      {/* Header with mentor avatar */}
      <div className="glass-card rounded-t-xl p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/30">
            {settings?.avatar_url ? (
              <img
                src={settings.avatar_url}
                alt={settings.mentor_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-bold text-lg">
              {settings?.mentor_name || "Mi Mentor"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu asistente personal basado en IA
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Nueva conversación
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 glass-card">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              El conocimiento sin ejecución es solo ruido. Por eso, he volcado toda mi trayectoria en esta IA para que te acompañe en las trincheras. Desde pulir tu oratoria hasta estructurar tu oferta, ¿en qué te puedo ayudar?
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-secondary"
                    : "bg-muted"
                )}
              >
                {msg.role === "assistant" ? (
                  settings?.avatar_url ? (
                    <img
                      src={settings.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  )
                ) : (
                  <span className="text-xs font-bold">Tú</span>
                )}
              </div>

              {/* Message content */}
              <div
                className={cn(
                  "max-w-[80%] space-y-2",
                  msg.role === "user" && "text-right"
                )}
              >
                <div
                  className={cn(
                    "inline-block p-3 rounded-2xl",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "glass rounded-tl-md"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="space-y-1">
                    {msg.citations.map((citation, cidx) => (
                      <button
                        key={cidx}
                        onClick={() => handleCitationClick(citation)}
                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors bg-primary/10 rounded-lg px-2 py-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>
                          {citation.program_title} → {citation.lesson_title}
                          {citation.timestamp && (
                            <span className="ml-1 font-mono">
                              [{formatTimestamp(citation.timestamp)}]
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {settings?.avatar_url ? (
                <img
                  src={settings.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div className="glass p-3 rounded-2xl rounded-tl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass-card rounded-b-xl p-4 border-t border-border/50">
        <div className="flex gap-2">
          <GlassInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta lo que necesites..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
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
