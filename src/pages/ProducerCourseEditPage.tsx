import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, GripVertical, Play, Trash2, Edit, 
  Video, Clock, Save, Eye, Settings, Loader2,
  ChevronDown, ChevronRight, Upload, X, Check, FileVideo, Image,
  Link2, FileText, DollarSign
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProgramDetail, Lesson, Module } from "@/hooks/usePrograms";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LessonResourceManager } from "@/components/lesson/LessonResourceManager";
import { useLessonResources } from "@/hooks/useLessonResources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProducerCourseEditPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    program,
    isLoading,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useProgramDetail(courseId);

  const [openModules, setOpenModules] = useState<string[]>([]);
  const [configOpen, setConfigOpen] = useState(false);
  
  // Program config editing state
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    is_published: false,
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  // Module dialog state
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  // Lesson dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string>("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    video_url: "",
    duration: "",
    is_preview: false,
  });
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Thumbnail editing state
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Delete dialogs
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // Lesson resources hook
  const { resources, isLoading: isLoadingResources, refetch: refetchResources } = useLessonResources(
    editingLesson?.id
  );

  // Initialize program form when program loads
  React.useEffect(() => {
    if (program) {
      setProgramForm({
        title: program.title,
        description: program.description || "",
        price: program.price,
        currency: program.currency,
        is_published: program.is_published,
      });
    }
  }, [program]);

  // Save program config
  const handleSaveConfig = async () => {
    if (!program || !programForm.title.trim()) return;
    
    setIsSavingConfig(true);
    try {
      const { error } = await supabase
        .from("programs")
        .update({
          title: programForm.title,
          description: programForm.description || null,
          price: programForm.price,
          currency: programForm.currency,
          is_published: programForm.is_published,
        })
        .eq("id", program.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo guardar la configuración.",
        });
        return;
      }

      toast({
        title: "Configuración guardada",
        description: "Los cambios se aplicaron correctamente.",
      });
      
      setConfigOpen(false);
      // Trigger a refresh
      window.location.reload();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar.",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Module handlers
  const openNewModuleDialog = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "" });
    setModuleDialogOpen(true);
  };

  const openEditModuleDialog = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
    });
    setModuleDialogOpen(true);
  };

  const handleModuleSubmit = async () => {
    if (!moduleForm.title.trim() || !program) return;

    setIsSubmittingModule(true);

    if (editingModule) {
      await updateModule(editingModule.id, moduleForm);
    } else {
      await createModule({
        program_id: program.id,
        title: moduleForm.title,
        description: moduleForm.description || null,
        sort_order: program.modules.length,
      });
    }

    setIsSubmittingModule(false);
    setModuleDialogOpen(false);
  };

  const handleDeleteModule = async () => {
    if (deleteModuleId) {
      await deleteModule(deleteModuleId);
      setDeleteModuleId(null);
    }
  };

  // Lesson handlers
  const openNewLessonDialog = (moduleId: string) => {
    setEditingLesson(null);
    setLessonModuleId(moduleId);
    setLessonForm({
      title: "",
      description: "",
      video_url: "",
      duration: "",
      is_preview: false,
    });
    setVideoFile(null);
    setLessonDialogOpen(true);
  };

  const openEditLessonDialog = (lesson: Lesson, moduleId: string) => {
    setEditingLesson(lesson);
    setLessonModuleId(moduleId);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      duration: lesson.duration || "",
      is_preview: lesson.is_preview,
    });
    setVideoFile(null);
    setLessonDialogOpen(true);
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lesson-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el video"
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lesson-videos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Formato no válido",
          description: "Por favor sube un archivo de video (MP4, WebM, OGG, MOV)"
        });
        return;
      }
      setVideoFile(file);
      setLessonForm(prev => ({ ...prev, video_url: "" }));
    }
  };

  const removeVideoFile = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleLessonSubmit = async () => {
    if (!lessonForm.title.trim()) return;

    setIsSubmittingLesson(true);

    let videoUrl = lessonForm.video_url;

    // Upload new video if file selected
    if (videoFile) {
      setIsUploadingVideo(true);
      const uploadedUrl = await uploadVideo(videoFile);
      setIsUploadingVideo(false);
      
      if (uploadedUrl) {
        videoUrl = uploadedUrl;
      } else {
        setIsSubmittingLesson(false);
        return;
      }
    }

    const lessonData = {
      title: lessonForm.title,
      description: lessonForm.description || null,
      video_url: videoUrl || null,
      duration: lessonForm.duration || null,
      is_preview: lessonForm.is_preview,
    };

    if (editingLesson) {
      await updateLesson(editingLesson.id, lessonData);
    } else {
      const module = program?.modules.find((m) => m.id === lessonModuleId);
      await createLesson({
        ...lessonData,
        module_id: lessonModuleId,
        sort_order: module?.lessons.length || 0,
      });
    }

    setIsSubmittingLesson(false);
    setLessonDialogOpen(false);
    setVideoFile(null);
  };

  const handleDeleteLesson = async () => {
    if (deleteLessonId) {
      await deleteLesson(deleteLessonId);
      setDeleteLessonId(null);
    }
  };

  // Thumbnail upload handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !program) return;

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
    setIsUploadingThumbnail(true);
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

      // Update program in database
      const { error: updateError } = await supabase
        .from("programs")
        .update({ thumbnail_url: urlData.publicUrl })
        .eq("id", program.id);

      if (updateError) {
        console.error("Update error:", updateError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar la portada.",
        });
        return;
      }

      toast({
        title: "Portada actualizada",
        description: "La imagen se guardó correctamente.",
      });

      // Refresh program data
      window.location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al subir la imagen.",
      });
      setThumbnailPreview(null);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleRemoveThumbnail = async () => {
    if (!program) return;

    setIsUploadingThumbnail(true);
    try {
      const { error } = await supabase
        .from("programs")
        .update({ thumbnail_url: null })
        .eq("id", program.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la portada.",
        });
        return;
      }

      setThumbnailPreview(null);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }

      toast({
        title: "Portada eliminada",
        description: "La imagen se eliminó correctamente.",
      });

      window.location.reload();
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <UnifiedSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!program) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <UnifiedSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-heading font-bold mb-2">
                Programa no encontrado
              </h2>
              <NeonButton onClick={() => navigate("/producer/courses")}>
                Volver a Programas
              </NeonButton>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const totalLessons = program.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedSidebar />
        <FloatingSidebarTrigger />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <button
                  onClick={() => navigate("/producer/courses")}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-heading font-bold text-lg">{program.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    {program.modules.length} módulos • {totalLessons} lecciones
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/course/${program.id}`)}
                  className="hidden sm:flex"
                >
                  <Eye className="w-4 h-4" />
                  Vista previa
                </NeonButton>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    program.is_published
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  )}
                >
                  {program.is_published ? "Publicado" : "Borrador"}
                </span>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 space-y-6">
            {/* Collapsible Configuration Section */}
            <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
              <HolographicCard className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-heading font-semibold">Configuración del Programa</h3>
                        <p className="text-xs text-muted-foreground">
                          Título, descripción, precio y estado
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="text-primary font-medium">
                          ${program.price} {program.currency}
                        </span>
                      </div>
                      {configOpen ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border/50 p-4 md:p-6 space-y-6">
                    {/* Title & Description */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-title">Título del programa</Label>
                          <GlassInput
                            id="edit-title"
                            value={programForm.title}
                            onChange={(e) => setProgramForm(prev => ({ ...prev, title: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Descripción</Label>
                          <Textarea
                            id="edit-description"
                            value={programForm.description}
                            onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                            className="glass min-h-[100px] mt-1"
                            placeholder="Describe el contenido del programa..."
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-price">Precio</Label>
                            <div className="relative mt-1">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <GlassInput
                                id="edit-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={programForm.price || ""}
                                onChange={(e) => setProgramForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="edit-currency">Moneda</Label>
                            <select
                              id="edit-currency"
                              value={programForm.currency}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, currency: e.target.value }))}
                              className="w-full mt-1 glass rounded-lg px-3 py-2 bg-background border border-border"
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="MXN">MXN</option>
                            </select>
                          </div>
                        </div>

                        {/* Publishing */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">Estado de publicación</p>
                            <p className="text-xs text-muted-foreground">
                              {programForm.is_published 
                                ? "Visible en el catálogo de alumnos" 
                                : "Solo visible para administradores"
                              }
                            </p>
                          </div>
                          <Switch
                            checked={programForm.is_published}
                            onCheckedChange={(checked) => setProgramForm(prev => ({ ...prev, is_published: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-border/50">
                      <NeonButton
                        onClick={handleSaveConfig}
                        disabled={isSavingConfig || !programForm.title.trim()}
                      >
                        {isSavingConfig ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Guardar Configuración
                      </NeonButton>
                    </div>
                  </div>
                </CollapsibleContent>
              </HolographicCard>
            </Collapsible>

            {/* Thumbnail Editor */}
            <HolographicCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Imagen de Portada
                </h2>
              </div>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="thumbnail-edit-upload"
              />

              {!thumbnailPreview && !program.thumbnail_url ? (
                <label
                  htmlFor="thumbnail-edit-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {isUploadingThumbnail ? (
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
                <div className="relative group">
                  <img
                    src={thumbnailPreview || program.thumbnail_url || ""}
                    alt="Portada del programa"
                    className="w-full max-h-64 object-cover rounded-lg border border-border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
                    <label
                      htmlFor="thumbnail-edit-upload"
                      className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <Edit className="w-5 h-5" />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="p-3 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {isUploadingThumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
            </HolographicCard>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <NeonButton variant="outline" onClick={openNewModuleDialog}>
                <Plus className="w-4 h-4" />
                Nuevo Módulo
              </NeonButton>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-lg">Contenido del Programa</h2>

              {program.modules.length === 0 ? (
                <HolographicCard className="p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Sin módulos</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primer módulo para organizar el contenido
                  </p>
                  <NeonButton onClick={openNewModuleDialog}>
                    <Plus className="w-4 h-4" />
                    Crear Módulo
                  </NeonButton>
                </HolographicCard>
              ) : (
                program.modules.map((module, moduleIndex) => {
                  const isOpen = openModules.includes(module.id);

                  return (
                    <Collapsible
                      key={module.id}
                      open={isOpen}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      <HolographicCard className="overflow-hidden">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                                {moduleIndex + 1}
                              </div>
                              <div className="text-left">
                                <h4 className="font-heading font-semibold">
                                  {module.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {module.lessons.length} lecciones
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModuleDialog(module);
                                }}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModuleId(module.id);
                                }}
                                className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {isOpen ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t border-border/50">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-border/30 last:border-0"
                              >
                                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-sm font-medium">
                                  {lessonIndex + 1}
                                </div>
                                <div className="w-12 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                                  {lesson.video_url ? (
                                    <Play className="w-4 h-4 text-primary" />
                                  ) : (
                                    <FileVideo className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium truncate">{lesson.title}</h5>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {lesson.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration}
                                      </span>
                                    )}
                                    {lesson.is_preview && (
                                      <span className="px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">
                                        Vista previa
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditLessonDialog(lesson, module.id)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteLessonId(lesson.id)}
                                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Add Lesson Button */}
                            <div className="p-4 border-t border-border/30">
                              <button
                                onClick={() => openNewLessonDialog(module.id)}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Agregar lección
                              </button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </HolographicCard>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Editar Módulo" : "Nuevo Módulo"}
              </DialogTitle>
              <DialogDescription>
                {editingModule
                  ? "Actualiza la información del módulo"
                  : "Agrega un nuevo módulo al programa"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Título del módulo *</Label>
                <GlassInput
                  placeholder="Ej: Introducción"
                  value={moduleForm.title}
                  onChange={(e) =>
                    setModuleForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Describe el contenido del módulo..."
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="glass min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <NeonButton variant="ghost" onClick={() => setModuleDialogOpen(false)}>
                Cancelar
              </NeonButton>
              <NeonButton
                onClick={handleModuleSubmit}
                disabled={!moduleForm.title.trim() || isSubmittingModule}
              >
                {isSubmittingModule ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingModule ? "Guardar" : "Crear"}
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="glass-strong max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? "Editar Lección" : "Nueva Lección"}
              </DialogTitle>
              <DialogDescription>
                {editingLesson
                  ? "Actualiza la información y recursos de la lección"
                  : "Agrega una nueva lección al módulo"}
              </DialogDescription>
            </DialogHeader>
            
            {editingLesson ? (
              <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Información
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Recursos ({resources.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="flex-1 overflow-y-auto mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Título *</Label>
                      <GlassInput
                        placeholder="Ej: Introducción al tema"
                        value={lessonForm.title}
                        onChange={(e) =>
                          setLessonForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        placeholder="Describe el contenido de la lección..."
                        value={lessonForm.description}
                        onChange={(e) =>
                          setLessonForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="glass min-h-[60px]"
                      />
                    </div>
                    <div>
                      <Label>Video de la lección</Label>
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={handleVideoFileChange}
                        className="hidden"
                      />
                      
                      {videoFile ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                          <FileVideo className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{videoFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeVideoFile}
                            className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : lessonForm.video_url ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                          <Play className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">Video actual</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {lessonForm.video_url}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLessonForm(prev => ({ ...prev, video_url: "" }))}
                            className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full p-6 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Haz clic para subir un video
                          </span>
                          <span className="text-xs text-muted-foreground">
                            MP4, WebM, OGG o MOV
                          </span>
                        </button>
                      )}
                      
                      {isUploadingVideo && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subiendo video...
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duración</Label>
                        <GlassInput
                          placeholder="Ej: 15:30"
                          value={lessonForm.duration}
                          onChange={(e) =>
                            setLessonForm((prev) => ({ ...prev, duration: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <Switch
                          checked={lessonForm.is_preview}
                          onCheckedChange={(checked) =>
                            setLessonForm((prev) => ({ ...prev, is_preview: checked }))
                          }
                        />
                        <Label className="cursor-pointer">Vista previa gratuita</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="flex-1 overflow-y-auto mt-4">
                  {isLoadingResources ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <LessonResourceManager
                      lessonId={editingLesson.id}
                      resources={resources}
                      onResourcesChange={refetchResources}
                      isAdmin={true}
                    />
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              // New lesson - only show basic info
              <div className="space-y-4 py-4">
                <div>
                  <Label>Título *</Label>
                  <GlassInput
                    placeholder="Ej: Introducción al tema"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Describe el contenido de la lección..."
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="glass min-h-[60px]"
                  />
                </div>
                <div>
                  <Label>Video de la lección</Label>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  
                  {videoFile ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                      <FileVideo className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeVideoFile}
                        className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full p-6 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Haz clic para subir un video
                      </span>
                      <span className="text-xs text-muted-foreground">
                        MP4, WebM, OGG o MOV
                      </span>
                    </button>
                  )}
                  
                  {isUploadingVideo && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo video...
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duración</Label>
                    <GlassInput
                      placeholder="Ej: 15:30"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm((prev) => ({ ...prev, duration: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={lessonForm.is_preview}
                      onCheckedChange={(checked) =>
                        setLessonForm((prev) => ({ ...prev, is_preview: checked }))
                      }
                    />
                    <Label className="cursor-pointer">Vista previa gratuita</Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Podrás agregar archivos y enlaces después de crear la lección
                </p>
              </div>
            )}
            
            <DialogFooter className="mt-4">
              <NeonButton variant="ghost" onClick={() => setLessonDialogOpen(false)}>
                Cancelar
              </NeonButton>
              <NeonButton
                onClick={handleLessonSubmit}
                disabled={!lessonForm.title.trim() || isSubmittingLesson}
              >
                {isSubmittingLesson ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingLesson ? "Guardar" : "Crear"}
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Module Dialog */}
        <AlertDialog
          open={!!deleteModuleId}
          onOpenChange={() => setDeleteModuleId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán todas las lecciones dentro de este módulo. Esta
                acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteModule}
                className="bg-destructive text-destructive-foreground"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Lesson Dialog */}
        <AlertDialog
          open={!!deleteLessonId}
          onOpenChange={() => setDeleteLessonId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar lección?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteLesson}
                className="bg-destructive text-destructive-foreground"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
};

export default ProducerCourseEditPage;
