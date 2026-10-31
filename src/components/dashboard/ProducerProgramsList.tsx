import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Play, BarChart3, Settings, ChevronRight, BookOpen, Clock } from "lucide-react";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import type { Program } from "@/hooks/usePrograms";

interface ProgramWithStats extends Program {
  enrollmentCount?: number;
  lessonCount?: number;
}

interface ProducerProgramsListProps {
  programs: ProgramWithStats[];
  isLoading?: boolean;
}

export function ProducerProgramsList({ programs, isLoading }: ProducerProgramsListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-card/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <HolographicCard className="text-center py-8">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No tienes programas creados</p>
        <NeonButton onClick={() => navigate("/producer/new-course")}>
          Crear mi primer programa
        </NeonButton>
      </HolographicCard>
    );
  }

  // Separate published and draft programs
  const publishedPrograms = programs.filter((p) => p.is_published);
  const draftPrograms = programs.filter((p) => !p.is_published);

  return (
    <div className="space-y-6">
      {/* Published Programs */}
      {publishedPrograms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Publicados ({publishedPrograms.length})
            </h3>
          </div>
          {publishedPrograms.slice(0, 3).map((program) => (
            <ProgramCard key={program.id} program={program} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Draft Programs */}
      {draftPrograms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Por lanzar ({draftPrograms.length})
            </h3>
          </div>
          {draftPrograms.slice(0, 2).map((program) => (
            <ProgramCard key={program.id} program={program} navigate={navigate} isDraft />
          ))}
        </div>
      )}

      {/* View all button */}
      {programs.length > 5 && (
        <NeonButton
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => navigate("/producer/courses")}
        >
          Ver todos los programas
          <ChevronRight className="w-4 h-4" />
        </NeonButton>
      )}
    </div>
  );
}

function ProgramCard({
  program,
  navigate,
  isDraft,
}: {
  program: ProgramWithStats;
  navigate: (path: string) => void;
  isDraft?: boolean;
}) {
  return (
    <HolographicCard className="flex items-center gap-4">
      {/* Thumbnail or icon */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
        {program.thumbnail_url ? (
          <img
            src={program.thumbnail_url}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-heading font-semibold truncate">{program.title}</h3>
          {isDraft && (
            <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30 text-yellow-500">
              <Clock className="w-3 h-3 mr-1" />
              Borrador
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {program.enrollmentCount ?? 0} alumnos
          </span>
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {program.lessonCount ?? 0} lecciones
          </span>
          <span className="text-primary font-medium">
            ${program.price}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/producer/analytics?program=${program.id}`)}
          className="p-2 rounded-lg glass hover:bg-white/5 transition-colors"
          title="Ver analytics"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(`/producer/courses/${program.id}`)}
          className="p-2 rounded-lg glass hover:bg-white/5 transition-colors"
          title="Editar programa"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </HolographicCard>
  );
}
