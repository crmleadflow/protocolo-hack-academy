import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, MoreVertical, Edit, Trash2, Eye, 
  Users, Play, Clock, BarChart3, Video, Settings,
  Loader2
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { usePrograms } from "@/hooks/usePrograms";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const ProducerCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { programs, isLoading, deleteProgram, updateProgram } = usePrograms();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "published" && program.is_published) ||
      (selectedStatus === "draft" && !program.is_published);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: programs.length,
    published: programs.filter((p) => p.is_published).length,
    draft: programs.filter((p) => !p.is_published).length,
  };

  const handleDelete = async () => {
    if (programToDelete) {
      await deleteProgram(programToDelete);
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await updateProgram(id, { is_published: !currentStatus });
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
                <div>
                  <h1 className="text-xl font-heading font-bold">Mis Programas</h1>
                  <p className="text-sm text-muted-foreground">
                    Gestiona y edita tus cursos
                  </p>
                </div>
              </div>
              <NeonButton onClick={() => navigate("/producer/new-course")}>
                <Plus className="w-4 h-4" />
                Nuevo Programa
              </NeonButton>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-primary">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total Programas</div>
              </HolographicCard>
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-green-500">
                  {stats.published}
                </div>
                <div className="text-sm text-muted-foreground">Publicados</div>
              </HolographicCard>
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-yellow-500">
                  {stats.draft}
                </div>
                <div className="text-sm text-muted-foreground">Borradores</div>
              </HolographicCard>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <GlassInput
                  placeholder="Buscar programas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "published", "draft"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "glass hover:bg-white/5"
                    )}
                  >
                    {status === "all"
                      ? "Todos"
                      : status === "published"
                      ? "Publicados"
                      : "Borradores"}
                  </button>
                ))}
              </div>
            </div>

            {/* Programs List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredPrograms.length === 0 ? (
              <HolographicCard className="p-12 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {programs.length === 0
                    ? "No tienes programas aún"
                    : "No se encontraron programas"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {programs.length === 0
                    ? "Crea tu primer programa para comenzar"
                    : "Intenta con otros términos de búsqueda"}
                </p>
                {programs.length === 0 && (
                  <NeonButton onClick={() => navigate("/producer/new-course")}>
                    <Plus className="w-4 h-4" />
                    Crear Programa
                  </NeonButton>
                )}
              </HolographicCard>
            ) : (
              <div className="grid gap-4">
                {filteredPrograms.map((program) => (
                  <HolographicCard
                    key={program.id}
                    className="flex flex-col lg:flex-row lg:items-center gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {program.thumbnail_url ? (
                        <img
                          src={program.thumbnail_url}
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-8 h-8 text-primary" />
                      )}
                    </div>

                    {/* Program Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-lg truncate">
                          {program.title}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            program.is_published
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          )}
                        >
                          {program.is_published ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {program.description || "Sin descripción"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="text-green-500 font-medium">
                          ${program.price} {program.currency}
                        </span>
                        <span className="text-xs">
                          Creado: {new Date(program.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/producer/course/${program.id}/edit`)}
                      >
                        <Video className="w-4 h-4" />
                        Contenido
                      </NeonButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-strong">
                          <DropdownMenuItem
                            onClick={() => navigate(`/course/${program.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver como alumno
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleTogglePublish(program.id, program.is_published)
                            }
                          >
                            {program.is_published ? (
                              <>
                                <Edit className="w-4 h-4 mr-2" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setProgramToDelete(program.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </HolographicCard>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar programa?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán todos los módulos
                y lecciones asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default ProducerCoursesPage;
