import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Send, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/glass-input";
import { useMentorChat, useMentorSettings } from "@/hooks/useMentor";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { VoiceControls } from "@/components/mentor/VoiceControls";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import mentorAvatar from "@/assets/hector-galensky-mentor-avatar.png";

interface MentorChatInterfaceProps {
  className?: string;
  onBack?: () => void;
}

const SUGGESTIONS = [
  "¿Cómo estructuro mi oferta?",
  "Ayúdame a pulir mi oratoria",
  "¿Cómo cierro más ventas?",
  "Dame un plan para mi primera semana",
];

export const MentorChatInterface: React.FC<MentorChatInterfaceProps> = ({
  className,
  onBack,
}) => {
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useMentorSettings();
  const { messages, isLoading, sendMessage, clearConversation } = useMentorChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  const {
    spanishVoices,
    selectedVoice,
    selectVoice,
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
  } = useSpeechSynthesis();

  const handleSpeak = (content: string, index: number) => {
    if (speakingMessageIndex === index && isSpeaking) {
      stop();
      setSpeakingMessageIndex(null);
    } else {
      setSpeakingMessageIndex(index);
      speak(content);
    }
  };

  // Reset speaking index when speech ends
  useEffect(() => {
    if (!isSpeaking && !isPaused) {
      setSpeakingMessageIndex(null);
    }
  }, [isSpeaking, isPaused]);

  // Respuesta nueva de la IA: se muestra desde su INICIO (no al final).
  // Mensaje del usuario / cargando: se baja al final para ver el indicador.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === "assistant" && !isLoading && lastMsgRef.current) {
      container.scrollTo({
        top: Math.max(lastMsgRef.current.offsetTop - 12, 0),
        behavior: "smooth",
      });
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
    // Solo al cambiar la cantidad de mensajes o el estado de carga
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isLoading]);

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
      <div
        className={cn(
          "flex flex-col h-full min-h-0 rounded-xl border border-border bg-card overflow-hidden",
          className
        )}
      >
        <div className="flex items-center gap-3 px-3 sm:px-4 h-14 border-b border-border">
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="border-t border-border p-3">
          <div className="h-11 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const mentorName = settings?.mentor_name || "Mi Mentor";

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Barra única compacta */}
      <header className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 h-14 sm:h-16 shrink-0 border-b border-border">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-primary/30 shrink-0">
          <img
            src={mentorAvatar}
            alt={mentorName}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading font-bold text-base sm:text-lg leading-tight truncate text-foreground">
            Mi Mentor IA
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight truncate">
            {mentorName} · Tu asistente 24/7
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="text-muted-foreground hover:text-destructive shrink-0 px-2 sm:px-3"
            title="Nueva conversación"
            aria-label="Nueva conversación"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva conversación</span>
          </Button>
        )}
      </header>

      {/* Mensajes: único elemento con scroll */}
      <div
        ref={scrollRef}
        className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-sm bg-muted">
              <img
                src={mentorAvatar}
                alt={mentorName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <p className="text-muted-foreground max-w-xl text-sm sm:text-base leading-relaxed">
              El conocimiento sin ejecución es solo ruido. Por eso, he volcado toda mi trayectoria en esta IA para que te acompañe en las trincheras. Desde pulir tu oratoria hasta estructurar tu oferta, ¿en qué te puedo ayudar?
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? lastMsgRef : undefined}
                className={cn(
                  "flex gap-2 sm:gap-3",
                  msg.role === "user" && "flex-row-reverse"
                )}
              >
                {/* Avatar de la IA (oculto en móvil para dar ancho a la burbuja) */}
                {msg.role === "assistant" && (
                  <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0 overflow-hidden bg-muted ring-1 ring-border mt-1">
                    <img
                      src={mentorAvatar}
                      alt=""
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}

                {/* Message content */}
                <div
                  className={cn(
                    "space-y-2 min-w-0",
                    msg.role === "assistant"
                      ? "max-w-[95%] sm:max-w-[min(88%,46rem)]"
                      : "max-w-[88%] sm:max-w-[min(80%,36rem)] text-right"
                  )}
                >
                  <div
                    className={cn(
                      "inline-block rounded-2xl text-left",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md p-3"
                        : "bg-muted/60 border border-border rounded-tl-md"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="px-4 pt-3 pb-2">
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed prose-p:my-2 prose-p:leading-7 prose-li:leading-7 prose-ul:my-2 prose-ol:my-2 prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-strong:font-semibold">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {isSupported && (
                          <div className="flex justify-end mt-2 pt-2 border-t border-border">
                            <VoiceControls
                              spanishVoices={spanishVoices}
                              selectedVoice={selectedVoice}
                              selectVoice={selectVoice}
                              isSpeaking={speakingMessageIndex === index && isSpeaking}
                              isPaused={speakingMessageIndex === index && isPaused}
                              isSupported={isSupported}
                              onSpeak={() => handleSpeak(msg.content, index)}
                              onPause={pause}
                              onResume={resume}
                              onStop={() => {
                                stop();
                                setSpeakingMessageIndex(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.content}</p>
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
            ))}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center overflow-hidden bg-muted ring-1 ring-border">
                  <img
                    src={mentorAvatar}
                    alt=""
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="bg-muted/60 border border-border px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caja de escribir: siempre visible abajo. En móvil deja libre el botón flotante del menú (abajo-izquierda). */}
      <div className="shrink-0 border-t border-border bg-card p-2 sm:p-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-md:pl-[4.75rem]">
        <div className="flex gap-2 max-w-4xl mx-auto">
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
            className="bg-primary hover:bg-primary/90 shrink-0"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
