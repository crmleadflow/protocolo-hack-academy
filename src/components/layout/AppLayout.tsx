import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
  showHeader?: boolean;
  showBreadcrumbs?: boolean;
}

export function AppLayout({ 
  children, 
  title, 
  subtitle, 
  headerContent,
  showHeader = true,
  showBreadcrumbs = true
}: AppLayoutProps) {
  const location = useLocation();
  const isProducerSection = location.pathname.startsWith("/producer");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedSidebar />

        <main className="flex-1 overflow-auto flex flex-col">
          {showHeader && (title || headerContent) && (
            <header className={cn(
              "sticky top-0 z-40 border-b border-border/50",
              isProducerSection ? "glass" : "glass-strong"
            )}>
              <div className="flex items-center justify-between px-4 md:px-6 py-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  {title && (
                    <div>
                      <h1 className={cn(
                        "text-xl md:text-2xl font-heading font-bold",
                        isProducerSection ? "text-gradient" : ""
                      )}>
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-sm text-muted-foreground">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {headerContent && (
                  <div className="flex items-center gap-4">
                    {headerContent}
                  </div>
                )}
              </div>
            </header>
          )}

          <div className="flex-1 p-4 md:p-6 lg:p-8">
            {/* Show breadcrumbs in producer section */}
            {showBreadcrumbs && isProducerSection && <AdminBreadcrumbs />}
            {children}
          </div>
        </main>
        
        <FloatingSidebarTrigger />
      </div>
    </SidebarProvider>
  );
}
