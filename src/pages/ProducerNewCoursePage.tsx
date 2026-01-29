import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, DollarSign, X, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProducerNewCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    thumbnail_url: "",
    is_published: true, // Por defecto siempre publicado para que sea visible en el catálogo
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Archivo inválido",
        description: "Solo se permiten imágenes (JPG, PNG, WebP, etc.)",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "La imagen no puede superar 5MB",
      });
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setThumbnailPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
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

      // Get public URL
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
            is_published: formData.is_published,
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
        title: "Programa creado",
        description: "El programa se creó correctamente.",
      });

      navigate(`/producer/course/${data.id}/edit`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <button
                  onClick={() => navigate("/producer/courses")}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-heading font-bold">
                    Crear Nuevo Programa
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Configura los detalles de tu nuevo programa
                  </p>
                </div>
              </div>
              <NeonButton
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title.trim()}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creando...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Crear Programa
                  </>
                )}
              </NeonButton>
            </div>
          </header>

          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <HolographicCard variant="gradient">
                <h2 className="font-heading font-bold text-lg mb-4">
                  Información Básica
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título del programa *</Label>
                    <GlassInput
                      id="title"
                      name="title"
                      placeholder="Ej: Protocolo de Ventas Avanzado"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe el contenido y objetivos del programa..."
                      value={formData.description}
                      onChange={handleChange}
                      className="glass min-h-[120px]"
                    />
                  </div>
                </div>
              </HolographicCard>

              {/* Pricing */}
              <HolographicCard>
                <h2 className="font-heading font-bold text-lg mb-4">Precio</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <div className="relative">
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
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
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
                      className="w-full glass rounded-lg px-3 py-2 bg-background border border-border"
                    >
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                    </select>
                  </div>
                </div>
              </HolographicCard>

              {/* Media - File Upload */}
              <HolographicCard>
                <h2 className="font-heading font-bold text-lg mb-4">
                  Imagen de Portada
                </h2>

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
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Subiendo...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Haz clic para subir una imagen
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          JPG, PNG o WebP. Máximo 5MB. Recomendado: 1280x720px
                        </span>
                      </div>
                    )}
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={thumbnailPreview || formData.thumbnail_url}
                      alt="Portada del programa"
                      className="w-full max-h-64 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </HolographicCard>

              {/* Publishing */}
              <HolographicCard>
                <h2 className="font-heading font-bold text-lg mb-4">
                  Publicación
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Publicar inmediatamente</p>
                    <p className="text-sm text-muted-foreground">
                      Los alumnos podrán ver el programa en el catálogo
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_published: checked }))
                    }
                  />
                </div>
              </HolographicCard>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/producer/courses")}
                  className="px-6 py-3 rounded-lg border border-border hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <NeonButton
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creando...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Crear Programa
                    </>
                  )}
                </NeonButton>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerNewCoursePage;
