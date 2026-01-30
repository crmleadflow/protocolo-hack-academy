import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, MoreVertical, Edit, Trash2, Eye, 
  Play, Video, Loader2, BookOpen, GripVertical
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { usePrograms, type Program } from "@/hooks/usePrograms";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";

const ProducerCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { programs, isLoading, deleteProgram, updateProgram, updateProgramOrder } = usePrograms();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = programs.findIndex((p) => p.id === active.id);
      const newIndex = programs.findIndex((p) => p.id === over.id);
      
      const newOrder = arrayMove(programs, oldIndex, newIndex);
      const orderedIds = newOrder.map((p) => p.id);
      
      const success = await updateProgramOrder(orderedIds);
      if (success) {
        toast({
          title: "Orden actualizado",
          description: "El orden de los programas se ha guardado correctamente",
        });
      }
    }
  };

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

  const canDragAndDrop = selectedStatus === "all" && !searchQuery;

  return (
    <AppLayout
      title="Mis Programas"
      subtitle={`Gestiona y edita tus cursos${canDragAndDrop ? " • Arrastra para reordenar" : ""}`}
      headerContent={
        <NeonButton onClick={() => navigate("/producer/new-course")}>
          <Plus className="w-4 h-4" />
          Nuevo Programa
        </NeonButton>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
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
        ) : canDragAndDrop ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredPrograms.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {filteredPrograms.map((program) => (
                  <SortableProgramRow
                    key={program.id}
                    program={program}
                    onEdit={() => navigate(`/producer/course/${program.id}/edit`)}
                    onView={() => navigate(`/course/${program.id}`)}
                    onTogglePublish={() => handleTogglePublish(program.id, program.is_published)}
                    onDelete={() => {
                      setProgramToDelete(program.id);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid gap-4">
            {filteredPrograms.map((program) => (
              <ProgramRow
                key={program.id}
                program={program}
                onEdit={() => navigate(`/producer/course/${program.id}/edit`)}
                onView={() => navigate(`/course/${program.id}`)}
                onTogglePublish={() => handleTogglePublish(program.id, program.is_published)}
                onDelete={() => {
                  setProgramToDelete(program.id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

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
    </AppLayout>
  );
};

// Sortable wrapper for drag and drop
interface ProgramRowProps {
  program: Program;
  onEdit: () => void;
  onView: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
  isDragging?: boolean;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
}

function SortableProgramRow(props: Omit<ProgramRowProps, "dragListeners" | "dragAttributes" | "isDragging">) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.program.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-90")}
    >
      <ProgramRow
        {...props}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}

function ProgramRow({
  program,
  onEdit,
  onView,
  onTogglePublish,
  onDelete,
  isDragging,
  dragListeners,
  dragAttributes,
}: ProgramRowProps) {
  return (
    <HolographicCard
      className={cn(
        "flex flex-col lg:flex-row lg:items-center gap-4",
        isDragging && "shadow-2xl shadow-primary/20 ring-2 ring-primary/50"
      )}
    >
      {/* Drag Handle */}
      {dragListeners && (
        <button
          type="button"
          {...dragListeners}
          {...dragAttributes}
          className="hidden lg:flex p-2 rounded-lg hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

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
        <NeonButton size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4" />
          Editar
        </NeonButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-strong">
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              Ver como alumno
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTogglePublish}>
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
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </HolographicCard>
  );
}

export default ProducerCoursesPage;
