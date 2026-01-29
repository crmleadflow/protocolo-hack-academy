import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { MentorChatInterface } from "@/components/mentor/MentorChatInterface";

const MentorPage: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-heading font-bold text-gradient mb-2">
                Héctor Galensky AI: Tu Mentor 24/7
              </h1>
            </div>

            <MentorChatInterface />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MentorPage;
