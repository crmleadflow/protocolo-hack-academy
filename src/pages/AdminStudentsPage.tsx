import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
  Users, Search, UserPlus, Check, Ban,
  BookOpen, Loader2, CheckCircle2, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { ProducerCollapsibleNav } from "@/components/dashboard/ProducerCollapsibleNav";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  enrollments: Array<{
    id: string;
    program_id: string;
    program_title: string;
    status: string;
    enrolled_at: string | null;
    is_manual: boolean;
  }>;
}

interface Program {
  id: string;
  title: string;
}

interface ProgramStats {
  programId: string;
  programTitle: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

const AdminStudentsPage: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchStudentsAndPrograms();
  }, []);

  const fetchStudentsAndPrograms = async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name");

      if (profilesError) throw profilesError;

      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("id, title");

      if (programsError) throw programsError;

      setPrograms(programsData || []);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("id, user_id, program_id, status, enrolled_at, is_manual");

      if (enrollmentsError) throw enrollmentsError;

      const studentsWithEnrollments: Student[] = (profilesData || []).map((profile) => {
        const userEnrollments = (enrollmentsData || [])
          .filter((e) => e.user_id === profile.user_id)
          .map((e) => ({
            id: e.id,
            program_id: e.program_id,
            program_title: programsData?.find((p) => p.id === e.program_id)?.title || "Unknown",
            status: e.status,
            enrolled_at: e.enrolled_at,
            is_manual: e.is_manual,
          }));

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

  const handleEnrollStudent = async () => {
    if (!selectedStudent || !selectedProgram) return;

    setIsEnrolling(true);
    try {
      const { error } = await supabase.from("enrollments").upsert(
        {
          user_id: selectedStudent.user_id,
          program_id: selectedProgram,
          status: "active",
          enrolled_at: new Date().toISOString(),
          is_manual: true,
        },
        { onConflict: "user_id,program_id" }
      );

      if (error) throw error;

      toast({
        title: "Estudiante inscrito",
        description: "El estudiante ha sido inscrito manualmente al programa",
      });

      setShowEnrollModal(false);
      setSelectedStudent(null);
      setSelectedProgram("");
      fetchStudentsAndPrograms();
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo inscribir al estudiante",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleRevokeEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "cancelled" })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast({
        title: "Acceso revocado",
        description: "El acceso al programa ha sido cancelado",
      });

      fetchStudentsAndPrograms();
    } catch (error) {
      console.error("Error revoking enrollment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo revocar el acceso",
      });
    }
  };

  const handleReactivateEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "active" })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast({
        title: "Acceso reactivado",
        description: "El acceso al programa ha sido reactivado",
      });

      fetchStudentsAndPrograms();
    } catch (error) {
      console.error("Error reactivating enrollment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reactivar el acceso",
      });
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
    if (activeTab !== "all") {
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

  // Get students with no enrollments for "Sin Programa" tab
  const studentsWithoutEnrollments = useMemo(() => {
    return students.filter((student) => student.enrollments.length === 0);
  }, [students]);

  const openEnrollModal = (student: Student) => {
    setSelectedStudent(student);
    setShowEnrollModal(true);
  };

  const totalActiveEnrollments = students.filter((s) =>
    s.enrollments.some((e) => e.status === "active")
  ).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />
        <FloatingSidebarTrigger />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-6">
            {/* Global Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

              {/* Content for all tabs */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <TabsContent value="all" className="mt-0">
                    <StudentTable
                      students={filteredStudents}
                      onEnroll={openEnrollModal}
                      onRevoke={handleRevokeEnrollment}
                      onReactivate={handleReactivateEnrollment}
                      showPrograms
                    />
                  </TabsContent>

                  {programs.map((program) => (
                    <TabsContent key={program.id} value={program.id} className="mt-0">
                      <StudentTable
                        students={filteredStudents}
                        onEnroll={openEnrollModal}
                        onRevoke={handleRevokeEnrollment}
                        onReactivate={handleReactivateEnrollment}
                        filterProgramId={program.id}
                      />
                    </TabsContent>
                  ))}

                  <TabsContent value="none" className="mt-0">
                    <StudentTable
                      students={studentsWithoutEnrollments.filter(
                        (s) =>
                          !searchTerm ||
                          s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.user_id.toLowerCase().includes(searchTerm.toLowerCase())
                      )}
                      onEnroll={openEnrollModal}
                      onRevoke={handleRevokeEnrollment}
                      onReactivate={handleReactivateEnrollment}
                      showPrograms
                      emptyMessage="No hay usuarios sin programa asignado"
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
            </div>
          </div>
        </main>

        {/* Enroll Modal */}
        <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inscribir Estudiante</DialogTitle>
              <DialogDescription>
                Inscribir manualmente a {selectedStudent?.full_name || "estudiante"} en un programa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seleccionar Programa</label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <NeonButton variant="ghost" onClick={() => setShowEnrollModal(false)}>
                Cancelar
              </NeonButton>
              <NeonButton onClick={handleEnrollStudent} disabled={!selectedProgram || isEnrolling}>
                {isEnrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Inscribir
                  </>
                )}
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

// Student Table Component
interface StudentTableProps {
  students: Student[];
  onEnroll: (student: Student) => void;
  onRevoke: (enrollmentId: string) => void;
  onReactivate: (enrollmentId: string) => void;
  showPrograms?: boolean;
  filterProgramId?: string;
  emptyMessage?: string;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEnroll,
  onRevoke,
  onReactivate,
  showPrograms = false,
  filterProgramId,
  emptyMessage = "No hay estudiantes en este programa",
}) => {
  if (students.length === 0) {
    return (
      <HolographicCard className="p-12 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground">
          Los estudiantes aparecerán aquí cuando se inscriban
        </p>
      </HolographicCard>
    );
  }

  return (
    <HolographicCard className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            {showPrograms && <TableHead>Programas</TableHead>}
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const relevantEnrollments = filterProgramId
              ? student.enrollments.filter((e) => e.program_id === filterProgramId)
              : student.enrollments;

            const hasActiveEnrollment = relevantEnrollments.some((e) => e.status === "active");

            return (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                      {student.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium">{student.full_name || "Sin nombre"}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {student.user_id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>

                {showPrograms && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.enrollments.length === 0 ? (
                        <Badge variant="secondary">Sin inscripciones</Badge>
                      ) : (
                        <>
                          {student.enrollments.slice(0, 3).map((enrollment) => (
                            <Badge
                              key={enrollment.id}
                              variant={enrollment.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {enrollment.program_title.length > 12
                                ? `${enrollment.program_title.slice(0, 12)}...`
                                : enrollment.program_title}
                            </Badge>
                          ))}
                          {student.enrollments.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.enrollments.length - 3} más
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                )}

                <TableCell>
                  {filterProgramId ? (
                    relevantEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-2">
                        <Badge
                          variant={enrollment.status === "active" ? "default" : "secondary"}
                        >
                          {enrollment.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                        {enrollment.is_manual && (
                          <Badge variant="outline" className="text-xs">
                            Manual
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <Badge variant={hasActiveEnrollment ? "default" : "secondary"}>
                      {hasActiveEnrollment ? "Activo" : student.enrollments.length > 0 ? "Inactivo" : "Sin acceso"}
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {student.enrollments.length > 0 ? (
                      <>
                        {student.enrollments.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center gap-1">
                            {enrollment.status === "active" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRevoke(enrollment.id)}
                                className="h-8 text-xs border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Ban className="w-3 h-3 mr-1" />
                                Desactivar
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReactivate(enrollment.id)}
                                className="h-8 text-xs border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Activar
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEnroll(student)}
                          className="h-8 text-xs"
                        >
                          <UserPlus className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEnroll(student)}
                        className="h-8"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Inscribir
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </HolographicCard>
  );
};

export default AdminStudentsPage;
