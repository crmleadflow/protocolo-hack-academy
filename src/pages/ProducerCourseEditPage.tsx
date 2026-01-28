import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, GripVertical, Play, Trash2, Edit, 
  Video, Clock, Save, Eye, Settings, Loader2,
  ChevronDown, ChevronRight, Link2, X, Check
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProgramDetail, Lesson, Module } from "@/hooks/usePrograms";
import { cn } from "@/lib/utils";
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

  // Delete dialogs
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

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
    setLessonDialogOpen(true);
  };

  const handleLessonSubmit = async () => {
    if (!lessonForm.title.trim()) return;

    setIsSubmittingLesson(true);

    const lessonData = {
      title: lessonForm.title,
      description: lessonForm.description || null,
      video_url: lessonForm.video_url || null,
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
  };

  const handleDeleteLesson = async () => {
    if (deleteLessonId) {
      await deleteLesson(deleteLessonId);
      setDeleteLessonId(null);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ProducerSidebar />
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
          <ProducerSidebar />
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
                >
                  <Eye className="w-4 h-4" />
                  Vista previa
                </NeonButton>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    program.is_published
                      ? "bg-green-500/20 text-green-500"
                      : "bg-yellow-500/20 text-yellow-500"
                  )}
                >
                  {program.is_published ? "Publicado" : "Borrador"}
                </span>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">{totalLessons}</div>
                  <div className="text-xs text-muted-foreground">Lecciones</div>
                </div>
              </HolographicCard>
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">{program.modules.length}</div>
                  <div className="text-xs text-muted-foreground">Módulos</div>
                </div>
              </HolographicCard>
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">$</span>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">{program.price}</div>
                  <div className="text-xs text-muted-foreground">{program.currency}</div>
                </div>
              </HolographicCard>
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">
                    {program.is_published ? "Activo" : "Inactivo"}
                  </div>
                  <div className="text-xs text-muted-foreground">Estado</div>
                </div>
              </HolographicCard>
            </div>

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
                                    <Link2 className="w-4 h-4 text-muted-foreground" />
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
          <DialogContent className="glass-strong max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? "Editar Lección" : "Nueva Lección"}
              </DialogTitle>
              <DialogDescription>
                {editingLesson
                  ? "Actualiza la información de la lección"
                  : "Agrega una nueva lección al módulo"}
              </DialogDescription>
            </DialogHeader>
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
                <Label>URL del video</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <GlassInput
                    placeholder="https://youtube.com/watch?v=... o URL directa"
                    value={lessonForm.video_url}
                    onChange={(e) =>
                      setLessonForm((prev) => ({ ...prev, video_url: e.target.value }))
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Soporta YouTube, Vimeo o URLs directas de video
                </p>
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
            <DialogFooter>
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
