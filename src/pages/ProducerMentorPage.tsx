import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { MentorSettingsPanel } from "@/components/mentor/MentorSettingsPanel";
import { MentorDocumentsPanel } from "@/components/mentor/MentorDocumentsPanel";
import { Settings, FileText } from "lucide-react";

const ProducerMentorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <AppLayout
      title="Mi Mentor IA"
      subtitle="Configura y entrena tu mentor virtual"
    >
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
    </AppLayout>
  );
};

export default ProducerMentorPage;
