import React, { useState, useEffect } from "react";
import { 
  Settings, Lock, Bell, Shield, Loader2, Eye, EyeOff, 
  CheckCircle, AlertTriangle, Save
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [progressReminders, setProgressReminders] = useState(true);
  const [newContentAlerts, setNewContentAlerts] = useState(true);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Load user settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setEmailNotifications(data.email_notifications);
          setProgressReminders(data.progress_reminders);
          setNewContentAlerts(data.new_content_alerts);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, [user]);

  // Track changes
  const handleNotificationChange = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean
  ) => {
    setter(value);
    setSettingsChanged(true);
  };

  // Save notification preferences
  const handleSaveNotificationSettings = async () => {
    if (!user) return;

    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          email_notifications: emailNotifications,
          progress_reminders: progressReminders,
          new_content_alerts: newContentAlerts,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificaciones han sido actualizadas.",
      });
      setSettingsChanged(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente.",
      });

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordStrength = (password: string) => {
    if (!password) return { level: 0, text: "", color: "" };
    if (password.length < 6) return { level: 1, text: "Débil", color: "text-destructive" };
    if (password.length < 10) return { level: 2, text: "Media", color: "text-yellow-500" };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { level: 3, text: "Fuerte", color: "text-green-500" };
    }
    return { level: 2, text: "Media", color: "text-yellow-500" };
  };

  const strength = passwordStrength(newPassword);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-heading font-bold">Configuración</h1>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu cuenta y preferencias
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-2xl mx-auto space-y-6">
            {/* Account Info */}
            <HolographicCard className="p-6">
              <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Información de la Cuenta
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Correo electrónico</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Tipo de cuenta</span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    isAdmin 
                      ? "bg-secondary/20 text-secondary" 
                      : "bg-primary/20 text-primary"
                  )}>
                    {isAdmin ? "Administrador" : "Estudiante"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    Activo
                  </span>
                </div>
              </div>
            </HolographicCard>

            {/* Change Password */}
            <HolographicCard className="p-6">
              <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Cambiar Contraseña
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <GlassInput
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all",
                            strength.level === 1 && "w-1/3 bg-destructive",
                            strength.level === 2 && "w-2/3 bg-yellow-500",
                            strength.level === 3 && "w-full bg-green-500"
                          )}
                        />
                      </div>
                      <span className={cn("text-xs", strength.color)}>
                        {strength.text}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirmar nueva contraseña
                  </label>
                  <GlassInput
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <NeonButton
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </NeonButton>
              </div>
            </HolographicCard>

            {/* Notification Preferences */}
            <HolographicCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Preferencias de Notificaciones
                </h3>
                {settingsChanged && (
                  <span className="text-xs text-primary animate-pulse">
                    Cambios sin guardar
                  </span>
                )}
              </div>

              {isLoadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones por email</p>
                      <p className="text-sm text-muted-foreground">
                        Recibe actualizaciones importantes por correo
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={(value) => handleNotificationChange(setEmailNotifications, value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recordatorios de progreso</p>
                      <p className="text-sm text-muted-foreground">
                        Recibe recordatorios para continuar tu aprendizaje
                      </p>
                    </div>
                    <Switch
                      checked={progressReminders}
                      onCheckedChange={(value) => handleNotificationChange(setProgressReminders, value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alertas de nuevo contenido</p>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones cuando hay nuevos programas
                      </p>
                    </div>
                    <Switch
                      checked={newContentAlerts}
                      onCheckedChange={(value) => handleNotificationChange(setNewContentAlerts, value)}
                    />
                  </div>

                  <NeonButton
                    onClick={handleSaveNotificationSettings}
                    disabled={isSavingSettings || !settingsChanged}
                    className="w-full sm:w-auto mt-4"
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Preferencias
                      </>
                    )}
                  </NeonButton>
                </div>
              )}
            </HolographicCard>

            {/* Danger Zone */}
            <HolographicCard className="p-6 border-destructive/50">
              <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Zona de Peligro
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                Si deseas eliminar tu cuenta, contacta al soporte. Esta acción es irreversible.
              </p>

              <NeonButton
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  toast({
                    title: "Contactar Soporte",
                    description: "Para eliminar tu cuenta, envía un correo a soporte@protocolohack.com",
                  });
                }}
              >
                Solicitar Eliminación de Cuenta
              </NeonButton>
            </HolographicCard>
          </div>
        </main>
        
        <FloatingSidebarTrigger />
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;
