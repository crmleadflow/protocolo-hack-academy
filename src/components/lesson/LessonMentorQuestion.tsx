import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMentorChat, useMentorSettings } from "@/hooks/useMentor";
import ReactMarkdown from "react-markdown";
import mentorAvatar from "@/assets/hector-galensky-mentor-avatar.png";

interface LessonMentorQuestionProps {
  lessonTitle: string;
  programTitle: string;
  className?: string;
}

export const LessonMentorQuestion: React.FC<LessonMentorQuestionProps> = ({
  lessonTitle,
  programTitle,
  className,
}) => {
  const { settings } = useMentorSettings();
  const { messages, isLoading, sendMessage, clearConversation } = useMentorChat();
  const [question, setQuestion] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    // Prepend context about the lesson
    const contextualQuestion = `[Pregunta sobre la lección "${lessonTitle}" del programa "${programTitle}"]\n\n${question}`;
    
    const q = question;
    setQuestion("");
    setIsExpanded(true);
    await sendMessage(contextualQuestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <HolographicCard variant="gradient" className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/30 shadow-[0_0_15px_rgba(0,217,255,0.3)]">
          <img
            src={mentorAvatar}
            alt={settings?.mentor_name || "Mentor"}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Pregunta al Mentor
          </h3>
          <p className="text-xs text-muted-foreground">
            Pregúntale a {settings?.mentor_name || "tu mentor"} sobre este video
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearConversation();
              setIsExpanded(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages (if any) */}
      {isExpanded && messages.length > 0 && (
        <div className="max-h-[300px] overflow-y-auto space-y-3 p-3 rounded-lg bg-background/30">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-2",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-secondary"
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
                  <span className="text-[10px] font-bold">Tú</span>
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] p-2 rounded-xl text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background/50 rounded-tl-sm"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  // Remove the context prefix from displayed message
                  <p>{msg.content.replace(/\[Pregunta sobre la lección.*?\]\n\n/, "")}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                <img
                  src={mentorAvatar}
                  alt=""
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="bg-background/50 p-2 rounded-xl rounded-tl-sm">
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
      )}

      {/* Question Input */}
      <div className="flex gap-2">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`¿Tienes alguna duda sobre "${lessonTitle}"?`}
          className="min-h-[60px] bg-background/50 resize-none flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={handleAskQuestion}
          disabled={!question.trim() || isLoading}
          size="icon"
          className="h-auto aspect-square bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Quick suggestions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            "¿Cuál es el punto clave de esta lección?",
            "¿Puedes darme un ejemplo práctico?",
            "¿Cómo aplico esto en mi negocio?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuestion(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </HolographicCard>
  );
};
