import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, Search, Loader2, CheckCircle2, GraduationCap, BookOpen
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  StudentEnrollmentCard, 
  StudentWithEnrollments, 
  ProgramEnrollment 
} from "@/components/admin/StudentEnrollmentCard";

interface Program {
  id: string;
  title: string;
}

interface LessonProgress {
  lesson_id: string;
  user_id: string;
  completed: boolean;
}

interface ProgramStats {
  programId: string;
  programTitle: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

const AdminStudentsPage: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentWithEnrollments[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentsAndPrograms();
  }, []);

  const fetchStudentsAndPrograms = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name");

      if (profilesError) throw profilesError;

      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("id, title")
        .order("sort_order", { ascending: true });

      if (programsError) throw programsError;

      setPrograms(programsData || []);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("id, user_id, program_id, status, enrolled_at, is_manual");

      if (enrollmentsError) throw enrollmentsError;

      // Fetch modules to map lessons to programs
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, program_id");

      if (modulesError) throw modulesError;

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, module_id");

      if (lessonsError) throw lessonsError;

      // Fetch all lesson progress
      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select("lesson_id, user_id, completed");

      if (progressError) throw progressError;

      // Create a map of lesson_id to program_id
      const lessonToProgramMap = new Map<string, string>();
      (lessonsData || []).forEach((lesson) => {
        const module = (modulesData || []).find((m) => m.id === lesson.module_id);
        if (module) {
          lessonToProgramMap.set(lesson.id, module.program_id);
        }
      });

      // Create a map of program_id to total lessons count
      const programLessonsCount = new Map<string, number>();
      (lessonsData || []).forEach((lesson) => {
        const programId = lessonToProgramMap.get(lesson.id);
        if (programId) {
          programLessonsCount.set(
            programId, 
            (programLessonsCount.get(programId) || 0) + 1
          );
        }
      });

      // Build students with enrollments and progress
      const studentsWithEnrollments: StudentWithEnrollments[] = (profilesData || []).map((profile) => {
        const userEnrollments = (enrollmentsData || [])
          .filter((e) => e.user_id === profile.user_id)
          .map((e) => {
            const programTitle = programsData?.find((p) => p.id === e.program_id)?.title || "Unknown";
            const totalLessons = programLessonsCount.get(e.program_id) || 0;
            
            // Count completed lessons for this user in this program
            const completedLessons = (progressData || []).filter((p) => {
              const lessonProgramId = lessonToProgramMap.get(p.lesson_id);
              return p.user_id === profile.user_id && 
                     p.completed && 
                     lessonProgramId === e.program_id;
            }).length;

            const progress = totalLessons > 0 
              ? Math.round((completedLessons / totalLessons) * 100) 
              : 0;

            return {
              id: e.id,
              program_id: e.program_id,
              program_title: programTitle,
              status: e.status as ProgramEnrollment["status"],
              enrolled_at: e.enrolled_at,
              is_manual: e.is_manual,
              progress,
              completedLessons,
              totalLessons,
            };
          });

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: "",
          enrollments: userEnrollments,
        };
      });

      setStudents(studentsWithEnrollments);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnrollment = async (
    userId: string,
    programId: string,
    enrollmentId: string | null,
    currentStatus: "active" | null
  ) => {
    const updateKey = `${userId}-${programId}`;
    setIsUpdating(updateKey);

    try {
      if (currentStatus === "active") {
        // Deactivate
        if (enrollmentId) {
          const { error } = await supabase
            .from("enrollments")
            .update({ status: "cancelled" })
            .eq("id", enrollmentId);

          if (error) throw error;

          toast({
            title: "Acceso desactivado",
            description: "El acceso al programa ha sido cancelado",
          });
        }
      } else {
        // Activate or create
        const { error } = await supabase.from("enrollments").upsert(
          {
            user_id: userId,
            program_id: programId,
            status: "active",
            enrolled_at: new Date().toISOString(),
            is_manual: true,
          },
          { onConflict: "user_id,program_id" }
        );

        if (error) throw error;

        toast({
          title: "Acceso activado",
          description: "El estudiante ahora tiene acceso al programa",
        });
      }

      await fetchStudentsAndPrograms();
    } catch (error) {
      console.error("Error toggling enrollment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el acceso",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleAllPrograms = async (userId: string, activate: boolean) => {
    const updateKey = `all-${userId}`;
    setIsUpdating(updateKey);

    try {
      if (activate) {
        // Activate all programs
        const upsertData = programs.map((program) => ({
          user_id: userId,
          program_id: program.id,
          status: "active" as const,
          enrolled_at: new Date().toISOString(),
          is_manual: true,
        }));

        for (const enrollment of upsertData) {
          const { error } = await supabase.from("enrollments").upsert(
            enrollment,
            { onConflict: "user_id,program_id" }
          );
          if (error) throw error;
        }

        toast({
          title: "Todos los accesos activados",
          description: `Se activaron ${programs.length} programas para el estudiante`,
        });
      } else {
        // Deactivate all programs
        const student = students.find((s) => s.user_id === userId);
        if (student) {
          for (const enrollment of student.enrollments) {
            if (enrollment.id && enrollment.status === "active") {
              const { error } = await supabase
                .from("enrollments")
                .update({ status: "cancelled" })
                .eq("id", enrollment.id);
              if (error) throw error;
            }
          }
        }

        toast({
          title: "Todos los accesos desactivados",
          description: "Se cancelaron todos los accesos del estudiante",
        });
      }

      await fetchStudentsAndPrograms();
    } catch (error) {
      console.error("Error toggling all enrollments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron actualizar los accesos",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Calculate program statistics
  const programStats: ProgramStats[] = useMemo(() => {
    return programs.map((program) => {
      const studentsInProgram = students.filter((student) =>
        student.enrollments.some((e) => e.program_id === program.id)
      );
      const activeStudents = students.filter((student) =>
        student.enrollments.some((e) => e.program_id === program.id && e.status === "active")
      );
      const inactiveStudents = studentsInProgram.length - activeStudents.length;

      return {
        programId: program.id,
        programTitle: program.title,
        totalStudents: studentsInProgram.length,
        activeStudents: activeStudents.length,
        inactiveStudents,
      };
    });
  }, [programs, students]);

  // Filter students based on active tab and search term
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filter by program if not "all"
    if (activeTab === "none") {
      filtered = students.filter((student) => student.enrollments.length === 0);
    } else if (activeTab !== "all") {
      filtered = students.filter((student) =>
        student.enrollments.some((e) => e.program_id === activeTab)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [students, activeTab, searchTerm]);

  // Get students with no enrollments
  const studentsWithoutEnrollments = useMemo(() => {
    return students.filter((student) => student.enrollments.length === 0);
  }, [students]);

  const totalActiveEnrollments = students.filter((s) =>
    s.enrollments.some((e) => e.status === "active")
  ).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedSidebar />
        <FloatingSidebarTrigger />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Gestión de Alumnos
              </h1>
              <p className="text-muted-foreground">
                Administra inscripciones, activa o desactiva acceso a programas y visualiza el progreso de cada estudiante.
              </p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <div className="text-sm text-muted-foreground">Total Usuarios</div>
                  </div>
                </div>
              </HolographicCard>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalActiveEnrollments}</div>
                    <div className="text-sm text-muted-foreground">Con Acceso Activo</div>
                  </div>
                </div>
              </HolographicCard>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{programs.length}</div>
                    <div className="text-sm text-muted-foreground">Programas</div>
                  </div>
                </div>
              </HolographicCard>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studentsWithoutEnrollments.length}</div>
                    <div className="text-sm text-muted-foreground">Sin Programa</div>
                  </div>
                </div>
              </HolographicCard>
            </div>

            {/* Program Stats Cards */}
            {programStats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programStats.map((stat) => (
                  <HolographicCard key={stat.programId} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm line-clamp-1">{stat.programTitle}</h3>
                      <Badge variant="outline" className="shrink-0">
                        {stat.totalStudents} alumnos
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Activos:</span>
                        <span className="font-medium">{stat.activeStudents}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">Inactivos:</span>
                        <span className="font-medium">{stat.inactiveStudents}</span>
                      </div>
                    </div>
                  </HolographicCard>
                ))}
              </div>
            )}

            {/* Tabs for filtering by program */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    Todos ({students.length})
                  </TabsTrigger>
                  {programs.map((program) => {
                    const count = programStats.find((s) => s.programId === program.id)?.totalStudents || 0;
                    return (
                      <TabsTrigger key={program.id} value={program.id} className="text-xs sm:text-sm">
                        {program.title.length > 15 ? `${program.title.slice(0, 15)}...` : program.title} ({count})
                      </TabsTrigger>
                    );
                  })}
                  <TabsTrigger value="none" className="text-xs sm:text-sm">
                    Sin Programa ({studentsWithoutEnrollments.length})
                  </TabsTrigger>
                </TabsList>

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <GlassInput
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <HolographicCard className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No hay estudiantes</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "none" 
                      ? "Todos los usuarios tienen al menos un programa asignado"
                      : "Los estudiantes aparecerán aquí cuando se inscriban"}
                  </p>
                </HolographicCard>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <StudentEnrollmentCard
                      key={student.id}
                      student={student}
                      allPrograms={programs}
                      onToggleEnrollment={handleToggleEnrollment}
                      onToggleAllPrograms={handleToggleAllPrograms}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminStudentsPage;
