import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, Check, Upload, DollarSign, X, Loader2,
  FileText, Image, CreditCard, Sparkles
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  title: string;
  icon: React.ReactNode;
}

const StepIndicator: React.FC<StepProps> = ({ isActive, isCompleted, stepNumber, title, icon }) => (
  <div className={cn(
    "flex items-center gap-3 transition-all duration-300",
    isActive ? "opacity-100" : "opacity-50"
  )}>
    <div className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
      isCompleted 
        ? "bg-green-500 text-white" 
        : isActive 
          ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
          : "bg-muted text-muted-foreground"
    )}>
      {isCompleted ? <Check className="w-5 h-5" /> : icon}
    </div>
    <div className="hidden md:block">
      <p className="text-xs text-muted-foreground">Paso {stepNumber}</p>
      <p className={cn(
        "font-medium text-sm transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>{title}</p>
    </div>
  </div>
);

const ProducerNewCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    thumbnail_url: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const steps = [
    { number: 1, title: "Información", icon: <FileText className="w-5 h-5" /> },
    { number: 2, title: "Portada", icon: <Image className="w-5 h-5" /> },
    { number: 3, title: "Precio", icon: <CreditCard className="w-5 h-5" /> },
    { number: 4, title: "Confirmar", icon: <Sparkles className="w-5 h-5" /> },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Archivo inválido",
        description: "Solo se permiten imágenes (JPG, PNG, WebP, etc.)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "La imagen no puede superar 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setThumbnailPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-thumbnails")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          variant: "destructive",
          title: "Error al subir",
          description: "No se pudo subir la imagen. Intenta de nuevo.",
        });
        setThumbnailPreview(null);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("program-thumbnails")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        thumbnail_url: urlData.publicUrl,
      }));

      toast({
        title: "Imagen subida",
        description: "La portada se cargó correctamente.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al subir la imagen.",
      });
      setThumbnailPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return true; // Thumbnail is optional
      case 3:
        return true; // Price can be 0 (free)
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Falta el título",
        description: "Escribe el título del programa para continuar.",
      });
      return;
    }

    if (!session?.access_token) {
      toast({
        variant: "destructive",
        title: "Sesión no válida",
        description: "Tu sesión expiró. Cierra sesión y vuelve a iniciar.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-program`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            price: formData.price,
            currency: formData.currency,
            thumbnail_url: formData.thumbnail_url,
            is_published: true,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            data?.error || "No se pudo crear el programa. Intenta de nuevo.",
        });
        return;
      }

      toast({
        title: "🎉 ¡Programa creado!",
        description: "Ahora puedes agregar módulos y lecciones.",
      });

      navigate(`/producer/course/${data.id}/edit`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold mb-2">
                Información del Programa
              </h2>
              <p className="text-muted-foreground">
                Define el título y descripción de tu nuevo programa
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <Label htmlFor="title" className="text-base">
                  Título del programa *
                </Label>
                <GlassInput
                  id="title"
                  name="title"
                  placeholder="Ej: Protocolo de Ventas Avanzado"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-2 text-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Elige un título claro y atractivo para tus alumnos
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-base">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe el contenido y objetivos del programa..."
                  value={formData.description}
                  onChange={handleChange}
                  className="glass min-h-[150px] mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ayuda a los alumnos a entender qué aprenderán
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold mb-2">
                Imagen de Portada
              </h2>
              <p className="text-muted-foreground">
                Una buena imagen atrae más alumnos a tu programa
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="thumbnail-upload"
              />

              {!thumbnailPreview && !formData.thumbnail_url ? (
                <label
                  htmlFor="thumbnail-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <span className="text-muted-foreground">
                        Subiendo imagen...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">
                        Haz clic para subir una imagen
                      </span>
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG o WebP • Máximo 5MB • Recomendado: 1280x720px
                      </span>
                    </div>
                  )}
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={thumbnailPreview || formData.thumbnail_url}
                    alt="Portada del programa"
                    className="w-full h-64 object-cover rounded-xl border border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-3 right-3 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-4">
                Puedes agregar o cambiar la imagen después
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold mb-2">
                Precio del Programa
              </h2>
              <p className="text-muted-foreground">
                Define cuánto costará acceder a tu contenido
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-base">Precio</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <GlassInput
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ""}
                      onChange={handleChange}
                      className="pl-10 text-2xl font-bold text-center"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency" className="text-base">Moneda</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    className="w-full mt-2 glass rounded-lg px-3 py-3 bg-background border border-border text-lg"
                  >
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                  </select>
                </div>
              </div>

              <HolographicCard className="p-4 text-center">
                <p className="text-muted-foreground text-sm mb-1">
                  Tu precio final será:
                </p>
                <p className="text-3xl font-heading font-bold text-primary">
                  {formData.price === 0 ? (
                    <span className="text-green-500">GRATIS</span>
                  ) : (
                    `$${formData.price.toLocaleString()} ${formData.currency}`
                  )}
                </p>
              </HolographicCard>

              <p className="text-center text-sm text-muted-foreground">
                Puedes cambiar el precio en cualquier momento
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">
                ¡Todo listo!
              </h2>
              <p className="text-muted-foreground">
                Revisa los detalles de tu nuevo programa
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <HolographicCard variant="gradient" className="overflow-hidden">
                {(thumbnailPreview || formData.thumbnail_url) && (
                  <img
                    src={thumbnailPreview || formData.thumbnail_url}
                    alt="Portada"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Título
                    </p>
                    <p className="text-xl font-heading font-bold">
                      {formData.title || "Sin título"}
                    </p>
                  </div>

                  {formData.description && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Descripción
                      </p>
                      <p className="text-muted-foreground line-clamp-3">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Precio
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formData.price === 0 ? (
                          "Gratis"
                        ) : (
                          `$${formData.price} ${formData.currency}`
                        )}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm font-medium">
                      Publicado
                    </div>
                  </div>
                </div>
              </HolographicCard>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Después de crear el programa, podrás agregar módulos y lecciones
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />
        <FloatingSidebarTrigger />

        <main className="flex-1 overflow-auto flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <button
                  onClick={() => navigate("/producer/courses")}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg md:text-xl font-heading font-bold">
                    Crear Nuevo Programa
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Progress Steps */}
          <div className="border-b border-border/50 glass">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <StepIndicator
                      stepNumber={step.number}
                      title={step.title}
                      icon={step.icon}
                      isActive={currentStep === step.number}
                      isCompleted={currentStep > step.number}
                    />
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-2 md:mx-4 transition-colors duration-300",
                        currentStep > step.number ? "bg-green-500" : "bg-border"
                      )} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              {renderStepContent()}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="sticky bottom-0 glass-strong border-t border-border/50">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <NeonButton 
                    variant="ghost" 
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Anterior
                  </NeonButton>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep < 4 ? (
                  <NeonButton 
                    onClick={nextStep} 
                    disabled={!canProceed() || isUploading}
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </NeonButton>
                ) : (
                  <NeonButton 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="min-w-[180px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando...
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Crear Programa
                      </>
                    )}
                  </NeonButton>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerNewCoursePage;