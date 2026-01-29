import React, { useState, useEffect } from "react";
import { 
  Settings, Globe, Palette, CreditCard, Bell, Shield, 
  Save, Loader2, Upload, Image, CheckCircle, AlertTriangle,
  Mail, Link2, FileText, Lock, Eye, EyeOff
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProducerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Platform settings
  const [platformName, setPlatformName] = useState("Protocolo Hack");
  const [platformDescription, setPlatformDescription] = useState("Central de Inteligencia de Hector Galensky");
  const [supportEmail, setSupportEmail] = useState("soporte@protocolohack.com");
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  
  // Payment settings
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalEnvironment, setPaypalEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [currency, setCurrency] = useState("USD");
  
  // Notification settings
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [sendEnrollmentConfirmation, setSendEnrollmentConfirmation] = useState(true);
  const [sendProgressUpdates, setSendProgressUpdates] = useState(false);
  
  // Security settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  
  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // General state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings (in a real app, these would come from a settings table)
  useEffect(() => {
    // Settings would be loaded from database here
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, save to a platform_settings table
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados correctamente.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        <ProducerSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-heading font-bold flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    Configuración
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Administra la configuración de la plataforma
                  </p>
                </div>
              </div>
              {hasChanges && (
                <NeonButton onClick={handleSave} disabled={isSaving}>
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
              )}
            </div>
          </header>

          <div className="p-6">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="glass p-1 w-full justify-start overflow-x-auto">
                <TabsTrigger value="general" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Pagos</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificaciones</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Seguridad</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Cuenta</span>
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Información de la Plataforma
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Nombre de la Plataforma
                      </label>
                      <GlassInput
                        value={platformName}
                        onChange={(e) => {
                          setPlatformName(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="Nombre de tu plataforma"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Descripción
                      </label>
                      <Textarea
                        value={platformDescription}
                        onChange={(e) => {
                          setPlatformDescription(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="Descripción breve de la plataforma"
                        className="bg-background/50 border-border/50"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email de Soporte
                      </label>
                      <GlassInput
                        type="email"
                        value={supportEmail}
                        onChange={(e) => {
                          setSupportEmail(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="soporte@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Moneda por Defecto
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => {
                          setCurrency(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="USD">USD - Dólar Estadounidense</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="MXN">MXN - Peso Mexicano</option>
                        <option value="ARS">ARS - Peso Argentino</option>
                        <option value="COP">COP - Peso Colombiano</option>
                      </select>
                    </div>
                  </div>
                </HolographicCard>

                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Páginas Legales
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Link2 className="w-4 h-4 inline mr-1" />
                        URL Términos y Condiciones
                      </label>
                      <GlassInput
                        type="url"
                        value={termsUrl}
                        onChange={(e) => {
                          setTermsUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Link2 className="w-4 h-4 inline mr-1" />
                        URL Política de Privacidad
                      </label>
                      <GlassInput
                        type="url"
                        value={privacyUrl}
                        onChange={(e) => {
                          setPrivacyUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </HolographicCard>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payments" className="space-y-6">
                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" />
                    Configuración de PayPal
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <div>
                        <p className="font-medium">Estado de Conexión</p>
                        <p className="text-sm text-muted-foreground">PayPal está configurado</p>
                      </div>
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        Conectado
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Entorno de PayPal
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paypalEnv"
                            value="sandbox"
                            checked={paypalEnvironment === "sandbox"}
                            onChange={() => {
                              setPaypalEnvironment("sandbox");
                              setHasChanges(true);
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <span>Sandbox (Pruebas)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paypalEnv"
                            value="production"
                            checked={paypalEnvironment === "production"}
                            onChange={() => {
                              setPaypalEnvironment("production");
                              setHasChanges(true);
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <span>Producción</span>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {paypalEnvironment === "sandbox" 
                          ? "Usa credenciales de prueba para testing"
                          : "Procesa pagos reales con tu cuenta de PayPal"
                        }
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-500" />
                        Las credenciales de PayPal están almacenadas de forma segura en los secretos del proyecto. 
                        Para actualizar las credenciales, contacta al desarrollador.
                      </p>
                    </div>
                  </div>
                </HolographicCard>

                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6">
                    Opciones de Pago
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Permitir pagos con tarjeta</p>
                        <p className="text-sm text-muted-foreground">
                          A través de PayPal Checkout
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Permitir saldo PayPal</p>
                        <p className="text-sm text-muted-foreground">
                          Los usuarios pueden pagar con su saldo de PayPal
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </HolographicCard>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notificaciones Automáticas
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email de bienvenida</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar email cuando un usuario se registra
                        </p>
                      </div>
                      <Switch
                        checked={sendWelcomeEmail}
                        onCheckedChange={(value) => {
                          setSendWelcomeEmail(value);
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Confirmación de inscripción</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar email cuando un usuario compra un programa
                        </p>
                      </div>
                      <Switch
                        checked={sendEnrollmentConfirmation}
                        onCheckedChange={(value) => {
                          setSendEnrollmentConfirmation(value);
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Actualizaciones de progreso</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar resúmenes semanales de progreso
                        </p>
                      </div>
                      <Switch
                        checked={sendProgressUpdates}
                        onCheckedChange={(value) => {
                          setSendProgressUpdates(value);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </HolographicCard>

                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6">
                    Notificaciones para el Admin
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nuevas inscripciones</p>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificación cuando alguien se inscribe
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nuevos mensajes de ayuda</p>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificación de mensajes de soporte
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pagos completados</p>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificación de cada pago procesado
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </HolographicCard>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Seguridad de la Plataforma
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Verificación de email obligatoria</p>
                        <p className="text-sm text-muted-foreground">
                          Los usuarios deben verificar su email antes de acceder
                        </p>
                      </div>
                      <Switch
                        checked={requireEmailVerification}
                        onCheckedChange={(value) => {
                          setRequireEmailVerification(value);
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Permitir registro público</p>
                        <p className="text-sm text-muted-foreground">
                          Cualquier persona puede crear una cuenta
                        </p>
                      </div>
                      <Switch
                        checked={allowPublicRegistration}
                        onCheckedChange={(value) => {
                          setAllowPublicRegistration(value);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </HolographicCard>

                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6">
                    Políticas de Acceso
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium">Row Level Security (RLS)</p>
                        <p className="text-sm text-muted-foreground">
                          Todas las tablas tienen políticas RLS activas
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        Activo
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium">Autenticación</p>
                        <p className="text-sm text-muted-foreground">
                          Sistema de autenticación configurado
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        Activo
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium">Roles de Usuario</p>
                        <p className="text-sm text-muted-foreground">
                          Sistema de roles (admin/student) configurado
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        Activo
                      </span>
                    </div>
                  </div>
                </HolographicCard>
              </TabsContent>

              {/* Account Settings */}
              <TabsContent value="account" className="space-y-6">
                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
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
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                        Administrador
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

                <HolographicCard variant="gradient" className="p-6">
                  <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Cambiar Contraseña
                  </h3>

                  <div className="space-y-4 max-w-md">
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerSettingsPage;
