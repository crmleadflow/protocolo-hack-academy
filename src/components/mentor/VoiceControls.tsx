import React from "react";
import { Volume2, VolumeX, Pause, Play, Square, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface VoiceControlsProps {
  spanishVoices: Array<{ name: string; lang: string }>;
  selectedVoice: { name: string; lang: string } | null;
  selectVoice: (name: string) => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  onSpeak: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  className?: string;
  size?: "sm" | "default";
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  spanishVoices,
  selectedVoice,
  selectVoice,
  isSpeaking,
  isPaused,
  isSupported,
  onSpeak,
  onPause,
  onResume,
  onStop,
  className,
  size = "sm",
}) => {
  if (!isSupported) {
    return null;
  }

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Play/Pause/Resume button */}
      {!isSpeaking ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSpeak}
          className={cn(buttonSize, "text-primary hover:text-primary hover:bg-primary/10")}
          title="Escuchar respuesta"
        >
          <Volume2 className={iconSize} />
        </Button>
      ) : isPaused ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onResume}
          className={cn(buttonSize, "text-primary hover:text-primary hover:bg-primary/10")}
          title="Continuar"
        >
          <Play className={iconSize} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPause}
          className={cn(buttonSize, "text-primary hover:text-primary hover:bg-primary/10")}
          title="Pausar"
        >
          <Pause className={iconSize} />
        </Button>
      )}

      {/* Stop button - only show when speaking */}
      {isSpeaking && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onStop}
          className={cn(buttonSize, "text-destructive hover:text-destructive hover:bg-destructive/10")}
          title="Detener"
        >
          <Square className={iconSize} />
        </Button>
      )}

      {/* Voice selector */}
      {spanishVoices.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, "text-muted-foreground hover:text-foreground")}
              title="Seleccionar voz"
            >
              <Settings className={iconSize} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-h-64 overflow-y-auto">
            <DropdownMenuLabel>Voces en Español</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {spanishVoices.map((voice) => (
              <DropdownMenuItem
                key={voice.name}
                onClick={() => selectVoice(voice.name)}
                className={cn(
                  "cursor-pointer",
                  selectedVoice?.name === voice.name && "bg-primary/10 text-primary"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{voice.name}</span>
                  <span className="text-xs text-muted-foreground">{voice.lang}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
