import React, { useState, useEffect } from "react";
import { User, Camera, Save, Loader2, Mail, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ImageCropper } from "@/components/profile/ImageCropper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyProfileUpdate } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || "");
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;

      notifyProfileUpdate();

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo no válido",
        description: "Por favor selecciona una imagen.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 5MB.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setSelectedFileName(file.name);
    setSelectedFileSize(file.size);
    setCropperOpen(true);
    
    event.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    setCropperOpen(false);
    setIsUploadingAvatar(true);

    try {
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("program-thumbnails")
        .upload(filePath, croppedBlob, { 
          upsert: true,
          contentType: "image/jpeg"
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("program-thumbnails")
        .getPublicUrl(filePath);

      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: urlWithCacheBuster,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithCacheBuster);
      
      notifyProfileUpdate();
      
      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido actualizada.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
  };

  const initials = fullName 
    ? fullName.charAt(0).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || "U";

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("es-ES", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    : "Desconocido";

  return (
    <AppLayout
      title="Mi Perfil"
      subtitle="Gestiona tu información personal"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Avatar Section */}
          <HolographicCard className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-heading font-bold text-primary-foreground">
                      {initials}
                    </span>
                  )}
                </div>
                
                <label className={cn(
                  "absolute inset-0 rounded-full flex items-center justify-center",
                  "bg-background/80 backdrop-blur-sm cursor-pointer",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  isUploadingAvatar && "opacity-100"
                )}>
                  {isUploadingAvatar ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <Camera className="w-8 h-8 text-primary" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-heading font-bold mb-1">
                  {fullName || "Sin nombre"}
                </h2>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {memberSince}
                </p>
              </div>
            </div>
          </HolographicCard>

          {/* Edit Profile Form */}
          <HolographicCard className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información Personal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre completo
                </label>
                <GlassInput
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Correo electrónico
                </label>
                <GlassInput
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  El correo electrónico no se puede cambiar
                </p>
              </div>

              <NeonButton
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </NeonButton>
            </div>
          </HolographicCard>
        </div>
      )}
      
      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          imageSrc={selectedImage}
          fileName={selectedFileName}
          fileSize={selectedFileSize}
          onCropComplete={handleCropComplete}
        />
      )}
    </AppLayout>
  );
};

export default ProfilePage;
