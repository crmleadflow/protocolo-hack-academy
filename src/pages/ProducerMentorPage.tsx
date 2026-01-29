import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { ProducerCollapsibleNav, useCloseProducerNav } from "@/components/dashboard/ProducerCollapsibleNav";
import { MentorSettingsPanel } from "@/components/mentor/MentorSettingsPanel";
import { MentorDocumentsPanel } from "@/components/mentor/MentorDocumentsPanel";
import { Settings, FileText, Sparkles } from "lucide-react";

const ProducerMentorPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("settings");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Collapsible Navigation Header */}
            <ProducerCollapsibleNav
              title="Mentor IA"
              subtitle="Configura y entrena tu mentor virtual"
              icon={<Sparkles className="w-8 h-8 text-secondary" />}
              currentPath={location.pathname}
            />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="glass">
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Documentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings">
                <MentorSettingsPanel />
              </TabsContent>

              <TabsContent value="documents">
                <MentorDocumentsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerMentorPage;
