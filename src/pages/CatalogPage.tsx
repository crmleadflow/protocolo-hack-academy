import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Clock, BookOpen, Search, Lock, Loader2, CheckCircle, Filter, GripVertical
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HolographicCard } from "@/components/ui/holographic-card";
import { GlassInput } from "@/components/ui/glass-input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useStudentPrograms, ProgramWithProgress } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type FilterType = "all" | "active" | "locked";

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { programs, isLoading, updateProgramOrder } = useStudentPrograms();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

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

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) =>
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (program.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);

  return (
    <AppLayout 
      title="Arsenal de Entrenamiento"
      subtitle={`${programs.length} programas disponibles${isAdmin ? " • Arrastra para reordenar" : ""}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <GlassInput
                type="text"
                placeholder="Buscar programas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Activos
                </TabsTrigger>
                <TabsTrigger value="locked" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Bloqueados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Programs Grid */}
          {filteredPrograms.length === 0 ? (
            <HolographicCard className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold mb-2">
                {programs.length === 0
                  ? "No hay programas disponibles"
                  : "No se encontraron programas"}
              </h3>
              <p className="text-muted-foreground">
                {programs.length === 0
                  ? "Los programas aparecerán aquí cuando estén publicados"
                  : "Intenta con otros términos de búsqueda"}
              </p>
            </HolographicCard>
          ) : isAdmin && filter === "all" && !searchQuery ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredPrograms.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map((program, index) => (
                    <SortableProgramCard
                      key={program.id}
                      program={program}
                      index={index}
                      filter={filter}
                      onClick={() => navigate(`/course/${program.id}`)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program, index) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  index={index}
                  filter={filter}
                  onClick={() => navigate(`/course/${program.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

// Sortable wrapper for admin drag and drop
function SortableProgramCard({
  program,
  index,
  filter,
  onClick,
}: {
  program: ProgramWithProgress;
  index: number;
  filter: FilterType;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: program.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "opacity-90 scale-105"
      )}
    >
      <ProgramCard
        program={program}
        index={index}
        filter={filter}
        onClick={onClick}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}

// Program Card component
function ProgramCard({
  program,
  index,
  filter,
  onClick,
  dragListeners,
  dragAttributes,
  isDragging,
}: {
  program: ProgramWithProgress;
  index: number;
  filter: FilterType;
  onClick: () => void;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { hasActiveEnrollment } = useEnrollment(program.id);
  
  const isLocked = !isAdmin && !hasActiveEnrollment && program.price > 0;
  const isActive = isAdmin || hasActiveEnrollment || program.price === 0;

  if (filter === "active" && !isActive) return null;
  if (filter === "locked" && isActive) return null;

  const handleClick = () => {
    if (isLocked) {
      // Redirect to checkout for locked programs
      navigate(`/checkout/${program.id}`);
    } else {
      // Navigate to course for active/free programs
      onClick();
    }
  };

  return (
    <HolographicCard
      variant={program.progress > 0 ? "gradient" : "default"}
      className={cn(
        "group cursor-pointer animate-fade-in flex flex-col relative overflow-hidden",
        isDragging && "shadow-2xl shadow-primary/20 ring-2 ring-primary/50"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleClick}
    >
      {/* Drag Handle for Admin */}
      {dragListeners && (
        <button
          type="button"
          {...dragListeners}
          {...dragAttributes}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-20 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 transition-opacity cursor-grab active:cursor-grabbing hover:bg-primary/20 touch-none"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Program Thumbnail with Hover Lock */}
      <div className="relative aspect-video -mx-4 -mt-4 mb-4 overflow-hidden bg-muted">
        {program.thumbnail_url ? (
          <img
            src={program.thumbnail_url}
            alt={program.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-2 text-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-lg shadow-primary/20">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <span className="text-lg font-heading font-bold text-primary">
                ${program.price} {program.currency}
              </span>
              <span className="text-xs text-muted-foreground">
                Click para desbloquear
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3">
          {isActive && program.price > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
              <CheckCircle className="w-3 h-3" />
              Activo
            </span>
          )}
          {program.price === 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground backdrop-blur-sm">
              Gratis
            </span>
          )}
          {isLocked && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted/90 text-muted-foreground backdrop-blur-sm flex items-center gap-1">
              <Lock className="w-3 h-3" />
              ${program.price}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-2">
        <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors flex-1">
          {program.title}
        </h3>
        {program.progress > 0 && (
          <ProgressRing progress={program.progress} size={40} strokeWidth={3}>
            <span className="text-[10px] font-bold">{program.progress}%</span>
          </ProgressRing>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
        {program.description || "Sin descripción"}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {program.totalLessons} lecciones
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {program.modules.length} módulos
          </span>
        </div>
      </div>

      {program.progress > 0 && program.progress < 100 && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            style={{ width: `${program.progress}%` }}
          />
        </div>
      )}
    </HolographicCard>
  );
}

export default CatalogPage;