import React from "react";
import { Menu } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function FloatingSidebarTrigger() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Only show on mobile when sidebar is collapsed
  if (!isCollapsed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 md:hidden">
      {/* Pulse ring effect */}
      <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
      <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-primary via-secondary to-primary opacity-60 blur-md animate-pulse" />
      
      <SidebarTrigger 
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
      </SidebarTrigger>
    </div>
  );
}
