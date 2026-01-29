import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const VideoSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-cyan-400/80 to-purple-500/80 shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white/90 backdrop-blur-md border border-white/40 shadow-[0_0_12px_rgba(0,217,255,0.6)] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110" />
  </SliderPrimitive.Root>
));
VideoSlider.displayName = "VideoSlider";

export { VideoSlider };
