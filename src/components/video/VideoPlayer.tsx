import React from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onComplete?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  className,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [volume, setVolume] = React.useState(80);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative rounded-2xl overflow-hidden glass-strong group",
        className
      )}
    >
      <AspectRatio ratio={16 / 9}>
        {/* Video Embed */}
        <iframe
          src={videoUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Custom Overlay Controls (for demo purposes) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress Bar */}
          <div className="absolute bottom-16 left-4 right-4">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
              className="cursor-pointer"
            />
          </div>

          {/* Controls Row */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Skip Back */}
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play/Pause */}
              <button 
                onClick={togglePlay}
                className="p-3 rounded-full bg-primary hover:bg-primary/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                )}
              </button>

              {/* Skip Forward */}
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={toggleMute}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setVolume(value[0]);
                    setIsMuted(value[0] === 0);
                  }}
                  className="w-20"
                />
              </div>

              {/* Time */}
              <span className="text-sm text-muted-foreground ml-4">
                {Math.floor(progress * 0.12)}:{String(Math.floor((progress * 0.12 % 1) * 60)).padStart(2, '0')} / 12:34
              </span>
            </div>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};
