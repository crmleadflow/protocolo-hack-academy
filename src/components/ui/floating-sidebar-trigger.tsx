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
      <SidebarTrigger 
        className={cn(
          "h-14 w-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/30",
          "hover:bg-primary/90 hover:scale-105",
          "transition-all duration-200",
          "flex items-center justify-center",
          "animate-fade-in"
        )}
      >
        <Menu className="h-6 w-6" />
      </SidebarTrigger>
    </div>
  );
}
