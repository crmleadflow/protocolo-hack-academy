import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMentorChat, useMentorSettings } from "@/hooks/useMentor";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { VoiceControls } from "@/components/mentor/VoiceControls";
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
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    const contextualQuestion = `[Pregunta sobre la lección "${lessonTitle}" del programa "${programTitle}"]\n\n${question}`;
    
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
    <HolographicCard variant="gradient" className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/30 shadow-lg">
            <img
              src={mentorAvatar}
              alt={settings?.mentor_name || "Mentor"}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">Pregunta al Mentor</span>
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {settings?.mentor_name || "Tu mentor"} • En línea
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
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      {isExpanded && messages.length > 0 && (
        <div className="flex-1 min-h-0 max-h-[280px] overflow-y-auto space-y-3 p-3 rounded-xl bg-background/30 mb-4 scrollbar-thin scrollbar-thumb-primary/20">
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
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-secondary ring-1 ring-primary/30"
                    : "bg-muted ring-1 ring-border"
                )}
              >
                {msg.role === "assistant" ? (
                  <img
                    src={mentorAvatar}
                    alt=""
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md p-3"
                    : "bg-background/60 border border-border/50 rounded-tl-md"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="p-3 pb-1">
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {isSupported && (
                      <div className="flex justify-end mt-2 pt-2 border-t border-border/30">
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
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="p-3">{msg.content.replace(/\[Pregunta sobre la lección.*?\]\n\n/, "")}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-1 ring-primary/30">
                <img
                  src={mentorAvatar}
                  alt=""
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="bg-background/60 border border-border/50 p-3 rounded-2xl rounded-tl-md">
                <div className="flex gap-1.5">
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
      <div className="mt-auto">
        <div
          className={cn(
            "flex gap-2 p-1 rounded-xl transition-all duration-300",
            isFocused
              ? "ring-2 ring-primary/50 bg-background/50"
              : "bg-background/30"
          )}
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`¿Dudas sobre "${lessonTitle.slice(0, 30)}${lessonTitle.length > 30 ? '...' : ''}"?`}
            className="min-h-[50px] max-h-[100px] bg-transparent border-0 resize-none flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleAskQuestion}
            disabled={!question.trim() || isLoading}
            size="icon"
            className={cn(
              "h-10 w-10 self-end flex-shrink-0 transition-all",
              question.trim() && "shadow-[0_0_15px_rgba(var(--primary)/0.4)]"
            )}
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
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "¿Punto clave?",
              "Ejemplo práctico",
              "¿Cómo aplico esto?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuestion(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </HolographicCard>
  );
};
