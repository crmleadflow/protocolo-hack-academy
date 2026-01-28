import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, GripVertical, Play, Trash2, Edit, 
  Upload, Video, FileText, Clock, Save, Eye, Settings,
  ChevronDown, ChevronRight, MoreVertical, Link2, Image
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { demoCourses, DemoModule, DemoLesson } from "@/data/demo-data";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const ProducerCourseEditPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const course = demoCourses.find((c) => c.id === courseId) || demoCourses[0];
  const [modules, setModules] = useState<DemoModule[]>(course.modules || []);
  const [openModules, setOpenModules] = useState<string[]>([modules[0]?.id]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<DemoLesson | null>(null);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

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
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      course.color === "primary" && "bg-primary/20 text-primary",
                      course.color === "secondary" && "bg-secondary/20 text-secondary",
                      course.color === "accent" && "bg-accent/20 text-accent"
                    )}
                  >
                    <course.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-lg">{course.title}</h1>
                    <p className="text-xs text-muted-foreground">
                      {modules.length} módulos • {totalLessons} lecciones
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NeonButton variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                  Vista previa
                </NeonButton>
                <NeonButton variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </NeonButton>
                <NeonButton size="sm">
                  <Save className="w-4 h-4" />
                  Guardar
                </NeonButton>
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
                  <div className="text-xs text-muted-foreground">Videos</div>
                </div>
              </HolographicCard>
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">{course.duration}</div>
                  <div className="text-xs text-muted-foreground">Duración</div>
                </div>
              </HolographicCard>
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">{modules.length}</div>
                  <div className="text-xs text-muted-foreground">Módulos</div>
                </div>
              </HolographicCard>
              <HolographicCard className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">Publicado</div>
                  <div className="text-xs text-muted-foreground">Estado</div>
                </div>
              </HolographicCard>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
                <DialogTrigger asChild>
                  <NeonButton variant="outline">
                    <Plus className="w-4 h-4" />
                    Nuevo Módulo
                  </NeonButton>
                </DialogTrigger>
                <DialogContent className="glass-strong">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Módulo</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo módulo a tu curso
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Nombre del módulo
                      </label>
                      <GlassInput placeholder="Ej: Introducción al tema" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Descripción
                      </label>
                      <Textarea
                        placeholder="Describe brevemente el contenido del módulo..."
                        className="glass min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <NeonButton variant="ghost" onClick={() => setIsAddModuleDialogOpen(false)}>
                        Cancelar
                      </NeonButton>
                      <NeonButton onClick={() => setIsAddModuleDialogOpen(false)}>
                        Crear Módulo
                      </NeonButton>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <NeonButton>
                    <Upload className="w-4 h-4" />
                    Subir Video
                  </NeonButton>
                </DialogTrigger>
                <DialogContent className="glass-strong max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Subir Nuevo Video</DialogTitle>
                    <DialogDescription>
                      Sube un video a tu curso. Formatos soportados: MP4, MOV, WebM
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="font-heading font-semibold mb-2">
                        Arrastra tu video aquí
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        o haz clic para seleccionar un archivo
                      </p>
                      <NeonButton variant="outline" size="sm">
                        Seleccionar archivo
                      </NeonButton>
                    </div>

                    {/* Or use URL */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          o usar URL
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <GlassInput
                          placeholder="https://youtube.com/watch?v=... o URL de video"
                          className="w-full"
                        />
                      </div>
                      <NeonButton variant="outline">
                        <Link2 className="w-4 h-4" />
                        Importar
                      </NeonButton>
                    </div>

                    {/* Video Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Título del video
                        </label>
                        <GlassInput placeholder="Ej: Introducción al módulo" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Descripción
                        </label>
                        <Textarea
                          placeholder="Describe el contenido del video..."
                          className="glass min-h-[80px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Módulo
                          </label>
                          <select className="w-full glass rounded-lg px-3 py-2 text-sm">
                            {modules.map((mod) => (
                              <option key={mod.id} value={mod.id}>
                                {mod.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Thumbnail
                          </label>
                          <NeonButton variant="outline" size="sm" className="w-full">
                            <Image className="w-4 h-4" />
                            Subir imagen
                          </NeonButton>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                      <NeonButton variant="ghost" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancelar
                      </NeonButton>
                      <NeonButton onClick={() => setIsUploadDialogOpen(false)}>
                        <Upload className="w-4 h-4" />
                        Subir Video
                      </NeonButton>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-lg">Contenido del Curso</h2>

              {modules.map((module, moduleIndex) => {
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
                            <div className="p-2 rounded-lg hover:bg-white/10 cursor-grab">
                              <GripVertical className="w-5 h-5 text-muted-foreground" />
                            </div>
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
                              }}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              <div className="p-2 rounded-lg hover:bg-white/10 cursor-grab">
                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-sm font-medium">
                                {lessonIndex + 1}
                              </div>
                              <div className="w-16 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                                <Play className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium truncate">{lesson.title}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs",
                                    lesson.locked
                                      ? "bg-yellow-500/20 text-yellow-500"
                                      : "bg-green-500/20 text-green-500"
                                  )}
                                >
                                  {lesson.locked ? "Bloqueado" : "Disponible"}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="glass-strong">
                                    <DropdownMenuItem>
                                      <Play className="w-4 h-4 mr-2" />
                                      Reproducir
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Reemplazar video
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}

                          {/* Add Lesson Button */}
                          <button
                            onClick={() => setIsUploadDialogOpen(true)}
                            className="w-full flex items-center justify-center gap-2 p-4 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar lección
                          </button>
                        </div>
                      </CollapsibleContent>
                    </HolographicCard>
                  </Collapsible>
                );
              })}

              {/* Add Module Button */}
              <button
                onClick={() => setIsAddModuleDialogOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar nuevo módulo
              </button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerCourseEditPage;
