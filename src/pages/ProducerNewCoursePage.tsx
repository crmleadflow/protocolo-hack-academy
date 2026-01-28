import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Image, DollarSign } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePrograms } from "@/hooks/usePrograms";
import { useAuth } from "@/contexts/AuthContext";

const ProducerNewCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { createProgram } = usePrograms();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    thumbnail_url: "",
    is_published: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    const program = await createProgram({
      ...formData,
      created_by: user?.id,
    });

    setIsSubmitting(false);

    if (program) {
      navigate(`/producer/course/${program.id}/edit`);
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
              <NeonButton onClick={handleSubmit} disabled={isSubmitting || !formData.title.trim()}>
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
                <h2 className="font-heading font-bold text-lg mb-4">
                  Precio
                </h2>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full glass rounded-lg px-3 py-2 bg-background border border-border"
                    >
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                    </select>
                  </div>
                </div>
              </HolographicCard>

              {/* Media */}
              <HolographicCard>
                <h2 className="font-heading font-bold text-lg mb-4">
                  Imagen de Portada
                </h2>
                <div>
                  <Label htmlFor="thumbnail_url">URL de la imagen</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <GlassInput
                      id="thumbnail_url"
                      name="thumbnail_url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={formData.thumbnail_url}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ingresa la URL de una imagen. Recomendado: 1280x720px
                  </p>
                </div>

                {formData.thumbnail_url && (
                  <div className="mt-4">
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="w-full max-w-md rounded-lg border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
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
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerNewCoursePage;
