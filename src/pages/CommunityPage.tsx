import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, HelpCircle, MessagesSquare, Plus,
  BookOpen, Users, TrendingUp, Sparkles
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { CommunityChat } from "@/components/community/CommunityChat";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import { QuickPostInput } from "@/components/community/QuickPostInput";
import { useCommunityPosts, CommunityPost, ContentType } from "@/hooks/useCommunity";
import { useStudentPrograms } from "@/hooks/useStudentPrograms";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type TabType = "discussions" | "questions" | "chat";

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { programs, isLoading: programsLoading } = useStudentPrograms();
  
  const [activeTab, setActiveTab] = useState<TabType>("discussions");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [postDetailOpen, setPostDetailOpen] = useState(false);

  const { posts, isLoading: postsLoading, createPost, toggleLike, refetch } = useCommunityPosts(
    selectedProgramId || null
  );

  // Set initial program when loaded
  React.useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs, selectedProgramId]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "discussions") {
      return post.content_type === "discussion" || post.content_type === "announcement";
    }
    if (activeTab === "questions") {
      return post.content_type === "question";
    }
    return false;
  });

  const handleCreatePost = async (title: string, content: string, type: ContentType) => {
    await createPost(title, content, type);
  };

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
    setPostDetailOpen(true);
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
          <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold">
                    Comunidad
                  </h1>
                  <p className="text-muted-foreground">
                    Conecta con otros estudiantes y comparte conocimiento
                  </p>
                </div>
              </div>

              {/* Program Selector */}
              {programsLoading ? (
                <Skeleton className="h-10 w-64" />
              ) : programs.length === 0 ? (
                <div className="glass-card p-6 rounded-xl text-center">
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
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedProgramId}
                    onValueChange={setSelectedProgramId}
                  >
                    <SelectTrigger className="w-64 bg-background/50">
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
                    <Badge variant="outline" className="text-primary">
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
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabType)}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <TabsList className="glass h-12">
                    <TabsTrigger value="discussions" className="gap-2 h-10 px-4">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Discusiones</span>
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="gap-2 h-10 px-4">
                      <HelpCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Preguntas</span>
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="gap-2 h-10 px-4">
                      <MessagesSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Chat</span>
                    </TabsTrigger>
                  </TabsList>

                  {activeTab !== "chat" && (
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      variant="outline"
                      className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="hidden sm:inline">Publicación Avanzada</span>
                    </Button>
                  )}
                </div>

                {/* Discussions Tab */}
                <TabsContent value="discussions" className="space-y-4">
                  {/* Quick Post Input */}
                  <QuickPostInput
                    type="discussion"
                    onSubmit={handleCreatePost}
                    onOpenFullDialog={() => setCreateDialogOpen(true)}
                  />

                  {postsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-4 rounded-xl">
                          <div className="flex gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="glass-card p-8 rounded-xl text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">
                        No hay discusiones aún
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Usa el campo de arriba para iniciar una conversación
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <CommunityPostCard
                          key={post.id}
                          post={post}
                          onClick={() => handlePostClick(post)}
                          onLike={() => toggleLike(post.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Questions Tab */}
                <TabsContent value="questions" className="space-y-4">
                  {/* Quick Post Input */}
                  <QuickPostInput
                    type="question"
                    onSubmit={handleCreatePost}
                    onOpenFullDialog={() => setCreateDialogOpen(true)}
                  />

                  {postsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-4 rounded-xl">
                          <div className="flex gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="glass-card p-8 rounded-xl text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-8 h-8 text-secondary" />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">
                        No hay preguntas aún
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Usa el campo de arriba para hacer tu pregunta
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <CommunityPostCard
                          key={post.id}
                          post={post}
                          onClick={() => handlePostClick(post)}
                          onLike={() => toggleLike(post.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat">
                  {selectedProgram && (
                    <CommunityChat
                      programId={selectedProgramId}
                      programTitle={selectedProgram.title}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <CreatePostDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreatePost}
        isAdmin={isAdmin}
      />

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
