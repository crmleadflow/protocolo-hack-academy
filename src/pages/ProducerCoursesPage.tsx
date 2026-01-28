import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, MoreVertical, Edit, Trash2, Eye, 
  Users, Play, Clock, BarChart3, Video, Settings,
  ChevronRight, Upload
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { demoCourses } from "@/data/demo-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProducerCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const courses = demoCourses;

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const courseStats = {
    total: courses.length,
    published: 5,
    draft: 2,
    totalStudents: 12847,
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-primary">
                  {courseStats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total Programas</div>
              </HolographicCard>
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-green-500">
                  {courseStats.published}
                </div>
                <div className="text-sm text-muted-foreground">Publicados</div>
              </HolographicCard>
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-yellow-500">
                  {courseStats.draft}
                </div>
                <div className="text-sm text-muted-foreground">Borradores</div>
              </HolographicCard>
              <HolographicCard className="text-center p-4">
                <div className="text-3xl font-heading font-bold text-secondary">
                  {courseStats.totalStudents.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Alumnos</div>
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

            {/* Courses Grid */}
            <div className="grid gap-4">
              {filteredCourses.map((course) => {
                const isPublished = Math.random() > 0.3;
                const studentCount = Math.floor(Math.random() * 3000 + 500);
                const revenue = Math.floor(Math.random() * 50000 + 10000);

                return (
                  <HolographicCard
                    key={course.id}
                    className="flex flex-col lg:flex-row lg:items-center gap-4"
                  >
                    {/* Course Icon */}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0",
                        course.color === "primary" && "bg-primary/20 text-primary",
                        course.color === "secondary" && "bg-secondary/20 text-secondary",
                        course.color === "accent" && "bg-accent/20 text-accent"
                      )}
                    >
                      <course.icon className="w-8 h-8" />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-lg truncate">
                          {course.title}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            isPublished
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          )}
                        >
                          {isPublished ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {studentCount.toLocaleString()} alumnos
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          {course.totalLessons} lecciones
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1 text-green-500">
                          ${revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/producer/course/${course.id}/edit`)}
                      >
                        <Video className="w-4 h-4" />
                        Contenido
                      </NeonButton>
                      <NeonButton
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/producer/course/${course.id}/analytics`)}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </NeonButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-strong">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver como alumno
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </HolographicCard>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerCoursesPage;
