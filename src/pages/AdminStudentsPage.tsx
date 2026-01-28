import React, { useState, useEffect } from "react";
import { 
  Users, Search, UserPlus, Check, X, Mail,
  BookOpen, Loader2, CheckCircle2
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
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

const AdminStudentsPage: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  useEffect(() => {
    fetchStudentsAndPrograms();
  }, []);

  const fetchStudentsAndPrograms = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles (students)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name");

      if (profilesError) throw profilesError;

      // Fetch all programs
      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("id, title");

      if (programsError) throw programsError;

      setPrograms(programsData || []);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("id, user_id, program_id, status, enrolled_at, is_manual");

      if (enrollmentsError) throw enrollmentsError;

      // Combine data
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
          email: "", // Email comes from auth.users, we'll use user_id for display
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

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEnrollModal = (student: Student) => {
    setSelectedStudent(student);
    setShowEnrollModal(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-heading font-bold">Gestión de Estudiantes</h1>
                  <p className="text-sm text-muted-foreground">
                    Administra inscripciones y accesos a programas
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 lg:p-6 space-y-6">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <GlassInput
                  placeholder="Buscar por nombre o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <div className="text-sm text-muted-foreground">Total Estudiantes</div>
                  </div>
                </div>
              </HolographicCard>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {students.filter((s) => s.enrollments.some((e) => e.status === "active")).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Con Inscripciones Activas</div>
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
                    <div className="text-sm text-muted-foreground">Programas Disponibles</div>
                  </div>
                </div>
              </HolographicCard>
            </div>

            {/* Students list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <HolographicCard className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay estudiantes registrados</h3>
                <p className="text-muted-foreground">
                  Los estudiantes aparecerán aquí cuando se registren
                </p>
              </HolographicCard>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <HolographicCard key={student.id} className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {student.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.full_name || "Sin nombre"}</h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            ID: {student.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {student.enrollments.length === 0 ? (
                          <Badge variant="secondary">Sin inscripciones</Badge>
                        ) : (
                          student.enrollments.map((enrollment) => (
                            <div
                              key={enrollment.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass"
                            >
                              <span className="text-sm">{enrollment.program_title}</span>
                              <Badge
                                variant={enrollment.status === "active" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {enrollment.status === "active" ? "Activo" : "Inactivo"}
                              </Badge>
                              {enrollment.is_manual && (
                                <Badge variant="outline" className="text-xs">
                                  Manual
                                </Badge>
                              )}
                              {enrollment.status === "active" ? (
                                <button
                                  onClick={() => handleRevokeEnrollment(enrollment.id)}
                                  className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
                                  title="Revocar acceso"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivateEnrollment(enrollment.id)}
                                  className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                                  title="Reactivar acceso"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={() => openEnrollModal(student)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Inscribir
                      </NeonButton>
                    </div>
                  </HolographicCard>
                ))}
              </div>
            )}
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

export default AdminStudentsPage;
