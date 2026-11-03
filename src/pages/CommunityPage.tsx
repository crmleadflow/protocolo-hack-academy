import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessagesSquare, BookOpen, Users, TrendingUp, Crown, CalendarDays } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CommunityChat } from "@/components/community/CommunityChat";
import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import { LeaderboardSection } from "@/components/community/LeaderboardSection";
import { EventsSection } from "@/components/community/EventsSection";
import { MembersSection } from "@/components/community/MembersSection";
import { useMembers } from "@/hooks/useCommunityModules";
import { useCommunityPosts, CommunityPost } from "@/hooks/useCommunity";
import { useStudentPrograms } from "@/hooks/useStudentPrograms";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TabType = "chat" | "ranking" | "miembros" | "eventos";

const TAB_CLS =
  "gap-2 h-10 px-4 rounded-full uppercase tracking-wide text-xs font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background whitespace-nowrap";

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isStaff, user } = useAuth();
  const { programs: allPrograms, isLoading: programsLoading } = useStudentPrograms();
  const { enrollments } = useEnrollment();
  
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [postDetailOpen, setPostDetailOpen] = useState(false);

  // Filter programs to only show those with active enrollments (or all for admins)
  const programs = React.useMemo(() => {
    if (isAdmin) return allPrograms;
    
    return allPrograms.filter((program) => {
      const enrollment = enrollments.find((e) => e.program_id === program.id);
      return enrollment?.status === "active" && 
        (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());
    });
  }, [allPrograms, enrollments, isAdmin]);

  const { posts, createPost, toggleLike, refetch } = useCommunityPosts(
    selectedProgramId || null
  );

  const membersData = useMembers(selectedProgramId || null);
  const nameFor = React.useCallback(
    (id: string) =>
      id === user?.id
        ? "Tú"
        : membersData.members.find((m) => m.user_id === id)?.full_name || "Miembro",
    [membersData.members, user?.id]
  );

  // Set initial program when loaded
  React.useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs, selectedProgramId]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
    setPostDetailOpen(true);
    supabase.rpc("increment_post_views", { _post_id: post.id }).then(() => {});
  };

  const handleOpenPostById = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) handlePostClick(post);
    else toast.error("No se encontró esa publicación");
  };

  const handlePostLike = () => {
    if (selectedPost) {
      toggleLike(selectedPost.id);
      // Update selected post state
      setSelectedPost({
        ...selectedPost,
        user_liked: !selectedPost.user_liked,
        likes_count: selectedPost.user_liked
          ? selectedPost.likes_count - 1
          : selectedPost.likes_count + 1,
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <main className="flex-1 overflow-x-hidden">
          <FloatingSidebarTrigger />

          {/* Header */}
          <section className="container mx-auto px-4 pt-10 md:pt-16">
            <p className="pill mb-6 inline-flex">Protocolo Hack</p>
            <h1 className="display text-5xl md:text-8xl leading-[0.9]">
              Hack <span className="serif-accent text-primary normal-case">community</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Aprende, ejecuta y colabora con otros miembros de tu programa.
            </p>
          </section>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          {selectedProgramId && (
            <div className="container mx-auto px-4 mt-10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="overflow-x-auto">
                  <TabsList className="h-12 rounded-full bg-secondary p-1 flex-nowrap">
                    <TabsTrigger value="chat" className={TAB_CLS}>
                      <MessagesSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="ranking" className={TAB_CLS}>
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Ranking</span>
                    </TabsTrigger>
                    <TabsTrigger value="miembros" className={TAB_CLS}>
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Miembros</span>
                    </TabsTrigger>
                    <TabsTrigger value="eventos" className={TAB_CLS}>
                      <CalendarDays className="w-4 h-4" />
                      <span className="hidden sm:inline">Eventos</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

              </div>
            </div>
          )}

          <div className="container mx-auto px-4 mt-6">
            <div className="dark-island rounded-[2rem] p-6 md:p-10">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div><p className="display text-3xl md:text-5xl">{posts.filter(p=>p.content_type!=="question").length}</p><p className="text-xs uppercase tracking-widest opacity-70 mt-1">Discusiones</p></div>
                <div><p className="display text-3xl md:text-5xl">{posts.filter(p=>p.content_type==="question").length}</p><p className="text-xs uppercase tracking-widest opacity-70 mt-1">Preguntas</p></div>
                <div><p className="display text-3xl md:text-5xl text-primary">{posts.filter(p=>p.is_resolved).length}</p><p className="text-xs uppercase tracking-widest opacity-70 mt-1">Resueltas</p></div>
              </div>
              {/* Program Selector */}
              {programsLoading ? (
                <Skeleton className="h-10 w-64" />
              ) : programs.length === 0 ? (
                <div className="rounded-[2rem] bg-secondary p-6 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-heading font-semibold mb-2">
                    No tienes programas activos
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Inscríbete en un programa para acceder a la comunidad
                  </p>
                  <Button onClick={() => navigate("/catalog")}>
                    Explorar Programas
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Select
                    value={selectedProgramId}
                    onValueChange={setSelectedProgramId}
                  >
                    <SelectTrigger className="w-full sm:w-80 rounded-full bg-background text-foreground">
                      <SelectValue placeholder="Selecciona un programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProgram && (
                    <Badge variant="outline" className="rounded-full border-primary text-primary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {posts.length} publicaciones
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {selectedProgramId && (
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-6 py-4">

                {/* Chat Tab */}
                <TabsContent value="chat">
                  {selectedProgram && (
                    <CommunityChat
                      programId={selectedProgramId}
                      programTitle={selectedProgram.title}
                      isStaff={isStaff}
                      createPost={createPost}
                      onOpenPost={handleOpenPostById}
                      onItemCreated={refetch}
                    />
                  )}
                </TabsContent>

                {/* Ranking Tab */}
                <TabsContent value="ranking">
                  <LeaderboardSection programId={selectedProgramId} userId={user?.id} />
                </TabsContent>

                {/* Miembros Tab */}
                <TabsContent value="miembros">
                  <MembersSection
                    members={membersData.members}
                    incoming={membersData.incoming}
                    loading={membersData.loading}
                    userId={user?.id}
                    connect={membersData.connect}
                    respond={membersData.respond}
                    nameFor={nameFor}
                  />
                </TabsContent>

                {/* Eventos Tab */}
                <TabsContent value="eventos">
                  <EventsSection
                    programId={selectedProgramId}
                    isStaff={isStaff}
                    userId={user?.id}
                  />
                </TabsContent>

                {/* Oportunidades Tab */}
              </div>
            </div>
          )}
          </Tabs>
        </main>
      </div>

      {/* Dialogs */}
      <PostDetailDialog
        post={selectedPost}
        open={postDetailOpen}
        onOpenChange={setPostDetailOpen}
        onLike={handlePostLike}
      />
    </SidebarProvider>
  );
};

export default CommunityPage;
