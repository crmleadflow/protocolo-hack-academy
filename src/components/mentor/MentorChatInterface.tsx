import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Send, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/glass-input";
import { useMentorChat, useMentorSettings } from "@/hooks/useMentor";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import mentorAvatar from "@/assets/hector-galensky-mentor-avatar.png";

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      <div className={cn("flex flex-col h-[calc(100vh-200px)] min-h-[500px]", className)}>
        <div className="glass-card rounded-t-xl p-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 glass-card flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="glass-card rounded-b-xl p-4 border-t border-border/50">
          <div className="h-12 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-[calc(100vh-200px)] min-h-[500px]", className)}>
      {/* Header with mentor avatar */}
      <div className="glass-card rounded-t-xl p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/30 shadow-[0_0_15px_rgba(0,217,255,0.3)]">
            <img
              src={mentorAvatar}
              alt="Héctor Galensky"
              className="w-full h-full object-cover object-top"
            />
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
            {/* Holographic Avatar Container */}
            <div className="relative mb-6">
              {/* Outer glow rings */}
              <div className="absolute inset-0 w-48 h-48 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute inset-4 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: "20s" }} />
                <div className="absolute inset-6 rounded-full border border-secondary/30 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
              </div>
              
              {/* Avatar with holographic effect */}
              <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-primary/40 shadow-[0_0_40px_rgba(0,217,255,0.4),0_0_80px_rgba(176,38,255,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 z-10" />
                <img
                  src={mentorAvatar}
                  alt="Héctor Galensky"
                  className="w-full h-full object-cover object-top scale-110"
                  style={{ mixBlendMode: "normal" }}
                />
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse opacity-50" />
              </div>
              
              {/* Floating particles effect */}
              <div className="absolute -inset-4">
                <div className="absolute top-0 left-1/4 w-1 h-1 rounded-full bg-primary animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute top-1/4 right-0 w-1.5 h-1.5 rounded-full bg-secondary animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
                <div className="absolute bottom-1/4 left-0 w-1 h-1 rounded-full bg-cyan-400 animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />
              </div>
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
                    ? "bg-gradient-to-br from-primary to-secondary shadow-[0_0_10px_rgba(0,217,255,0.3)]"
                    : "bg-muted"
                )}
              >
                {msg.role === "assistant" ? (
                  <img
                    src={mentorAvatar}
                    alt=""
                    className="w-full h-full object-cover object-top"
                  />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,217,255,0.3)]">
              <img
                src={mentorAvatar}
                alt=""
                className="w-full h-full object-cover object-top"
              />
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
            onKeyDown={handleKeyDown}
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
