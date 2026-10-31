import React, { useState, useRef } from "react";
import {
  Camera,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMentorSettings } from "@/hooks/useMentor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const MentorSettingsPanel: React.FC = () => {
  const { settings, isLoading, updateSettings } = useMentorSettings();
  const [mentorName, setMentorName] = useState(settings?.mentor_name || "");
  const [welcomeMessage, setWelcomeMessage] = useState(settings?.welcome_message || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (settings) {
      setMentorName(settings.mentor_name);
      setWelcomeMessage(settings.welcome_message || "");
    }
  }, [settings]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to mentor-avatar bucket
      const fileExt = file.name.split(".").pop();
      const fileName = `mentor-avatar.${fileExt}`;
      
      // Delete old avatar if exists
      await supabase.storage.from("mentor-avatar").remove([fileName]);
      
      const { error: uploadError } = await supabase.storage
        .from("mentor-avatar")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("mentor-avatar")
        .getPublicUrl(fileName);

      // Update settings with new avatar URL
      await updateSettings({ avatar_url: urlData.publicUrl + `?t=${Date.now()}` });
      toast({ title: "Avatar actualizado" });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        mentor_name: mentorName,
        welcome_message: welcomeMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <h3 className="font-heading font-semibold text-lg">
        Configuración del Mentor
      </h3>

      {/* Avatar upload */}
      <div className="space-y-2">
        <Label>Avatar del Mentor</Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/30">
              {settings?.avatar_url ? (
                <img
                  src={settings.avatar_url}
                  alt="Mentor avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Cambiar avatar
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Esta imagen aparecerá en el chat con todos los alumnos
        </p>
      </div>

      {/* Mentor name */}
      <div className="space-y-2">
        <Label htmlFor="mentorName">Nombre del Mentor</Label>
        <Input
          id="mentorName"
          value={mentorName}
          onChange={(e) => setMentorName(e.target.value)}
          placeholder="Héctor Galensky"
        />
      </div>

      {/* Welcome message */}
      <div className="space-y-2">
        <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
        <Textarea
          id="welcomeMessage"
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          placeholder="¡Hola! Soy tu mentor virtual..."
          rows={3}
        />
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </>
        )}
      </Button>
    </div>
  );
};
