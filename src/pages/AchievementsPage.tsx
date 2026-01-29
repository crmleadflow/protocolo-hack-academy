import React, { useState } from "react";
import { Trophy, BookOpen, Users, Star, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { LevelProgressCard } from "@/components/achievements/LevelProgressCard";
import { useAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

const AchievementsPage: React.FC = () => {
  const { achievements, userXP, levelInfo, unlockedCount, totalCount, isLoading } =
    useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todos", icon: Trophy },
    { id: "progress", label: "Progreso", icon: BookOpen },
    { id: "social", label: "Social", icon: Users },
    { id: "milestone", label: "Hitos", icon: Star },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedInCategory =
    selectedCategory === "all"
      ? unlockedCount
      : achievements.filter((a) => a.category === selectedCategory && a.isUnlocked).length;

  const totalInCategory =
    selectedCategory === "all"
      ? totalCount
      : achievements.filter((a) => a.category === selectedCategory).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-heading font-bold flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-primary" />
                    Logros
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Tu progreso y reconocimientos
                  </p>
                </div>
              </div>

              {/* Stats summary */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Desbloqueados</p>
                  <p className="text-lg font-heading font-bold text-primary">
                    {unlockedCount}/{totalCount}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Level Progress */}
              {userXP && levelInfo && (
                <LevelProgressCard
                  totalXP={userXP.total_xp}
                  level={levelInfo.level}
                  levelName={levelInfo.name}
                  xpInCurrentLevel={levelInfo.xpInCurrentLevel}
                  xpNeededForNext={levelInfo.xpNeededForNext}
                  progressToNext={levelInfo.progressToNext}
                  nextLevelName={levelInfo.nextLevelName}
                  streak={userXP.current_streak}
                  longestStreak={userXP.longest_streak}
                />
              )}

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <TabsList className="glass h-auto p-1 flex-wrap">
                    {categories.map((cat) => (
                      <TabsTrigger
                        key={cat.id}
                        value={cat.id}
                        className={cn(
                          "flex items-center gap-2 data-[state=active]:bg-primary/20",
                          "data-[state=active]:text-primary"
                        )}
                      >
                        <cat.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{cat.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <p className="text-sm text-muted-foreground">
                    {unlockedInCategory} de {totalInCategory} desbloqueados
                  </p>
                </div>

                {/* Achievements Grid */}
                <TabsContent value={selectedCategory} className="mt-6">
                  {filteredAchievements.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No hay logros en esta categoría</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {/* Show unlocked first, then locked */}
                      {[...filteredAchievements]
                        .sort((a, b) => {
                          if (a.isUnlocked && !b.isUnlocked) return -1;
                          if (!a.isUnlocked && b.isUnlocked) return 1;
                          return a.sort_order - b.sort_order;
                        })
                        .map((achievement) => (
                          <AchievementBadge
                            key={achievement.id}
                            name={achievement.name}
                            description={achievement.description}
                            icon={achievement.icon}
                            xpReward={achievement.xp_reward}
                            category={achievement.category}
                            isUnlocked={achievement.isUnlocked}
                            unlockedAt={achievement.unlockedAt}
                            progress={achievement.progress}
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Achievement Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-3xl font-heading font-bold text-primary">
                    {userXP?.lessons_completed || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Lecciones completadas</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-3xl font-heading font-bold text-secondary">
                    {userXP?.modules_completed || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Módulos completados</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-3xl font-heading font-bold text-primary">
                    {userXP?.programs_completed || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Programas completados</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-3xl font-heading font-bold text-gradient">
                    {unlockedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Logros desbloqueados</p>
                </div>
              </div>
            </div>
          )}
        </main>

        <FloatingSidebarTrigger />
      </div>
    </SidebarProvider>
  );
};

export default AchievementsPage;
