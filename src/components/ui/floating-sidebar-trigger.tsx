import React from "react";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function FloatingSidebarTrigger() {
  const { isMobile, openMobile, toggleSidebar } = useSidebar();

  // Mobile-only global trigger (opens/closes the main sidebar sheet)
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Pulse ring effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-primary/40",
          openMobile ? "opacity-0" : "animate-ping"
        )}
      />
      <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-primary via-secondary to-primary opacity-60 blur-md animate-pulse" />
      
      <button
        type="button"
        aria-label={openMobile ? "Cerrar menú" : "Abrir menú"}
        onClick={toggleSidebar}
        className={cn(
          "relative h-14 w-14 rounded-full",
          "bg-gradient-to-br from-primary to-secondary",
          "text-primary-foreground",
          "shadow-[0_0_20px_rgba(0,217,255,0.5),0_0_40px_rgba(176,38,255,0.3)]",
          "hover:shadow-[0_0_30px_rgba(0,217,255,0.7),0_0_60px_rgba(176,38,255,0.5)]",
          "hover:scale-110",
          "transition-all duration-300",
          "flex items-center justify-center",
          "border border-white/20"
        )}
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
