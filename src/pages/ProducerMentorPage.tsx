import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { MentorSettingsPanel } from "@/components/mentor/MentorSettingsPanel";
import { MentorDocumentsPanel } from "@/components/mentor/MentorDocumentsPanel";
import { Settings, FileText } from "lucide-react";

const ProducerMentorPage: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-heading font-bold text-gradient mb-2">
                Configuración del Mentor IA
              </h1>
              <p className="text-muted-foreground">
                Configura y entrena tu mentor virtual con transcripciones y contenido
              </p>
            </div>

            <Tabs defaultValue="settings" className="space-y-6">
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
