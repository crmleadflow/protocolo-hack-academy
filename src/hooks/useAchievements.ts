import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: "progress" | "social" | "milestone";
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  is_hidden: boolean;
  sort_order: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

interface UserXP {
  total_xp: number;
  current_level: number;
  lessons_completed: number;
  modules_completed: number;
  programs_completed: number;
  current_streak: number;
  longest_streak: number;
}

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

// Level thresholds
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, name: "Novato" },
  { level: 2, xp: 100, name: "Aprendiz" },
  { level: 3, xp: 300, name: "Estudiante" },
  { level: 4, xp: 600, name: "Conocedor" },
  { level: 5, xp: 1000, name: "Avanzado" },
  { level: 6, xp: 1500, name: "Experto" },
  { level: 7, xp: 2500, name: "Maestro" },
  { level: 8, xp: 4000, name: "Gran Maestro" },
  { level: 9, xp: 6000, name: "Leyenda" },
  { level: 10, xp: 10000, name: "Élite" },
];

export function getLevelInfo(xp: number) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }

  const xpInCurrentLevel = xp - currentLevel.xp;
  const xpNeededForNext = nextLevel ? nextLevel.xp - currentLevel.xp : 0;
  const progressToNext = nextLevel ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    xpInCurrentLevel,
    xpNeededForNext,
    progressToNext,
    nextLevelName: nextLevel?.name || null,
  };
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all achievements
        const { data: allAchievements, error: achievementsError } = await supabase
          .from("achievements")
          .select("*")
          .order("sort_order");

        if (achievementsError) throw achievementsError;

        // Fetch user's unlocked achievements
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from("user_achievements")
          .select("achievement_id, unlocked_at")
          .eq("user_id", user.id);

        if (userAchievementsError) throw userAchievementsError;

        // Fetch user XP
        let { data: xpData, error: xpError } = await supabase
          .from("user_xp")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (xpError) throw xpError;

        // If no XP record, create one
        if (!xpData) {
          const { data: newXP, error: insertError } = await supabase
            .from("user_xp")
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          xpData = newXP;
        }

        setUserXP(xpData);

        // Map achievements with unlock status
        const unlockedMap = new Map(
          userAchievements?.map((ua) => [ua.achievement_id, ua.unlocked_at]) || []
        );

        const achievementsWithStatus: AchievementWithStatus[] = (allAchievements || [])
          .filter((a) => !a.is_hidden || unlockedMap.has(a.id))
          .map((achievement) => {
            const isUnlocked = unlockedMap.has(achievement.id);
            
            // Calculate progress based on requirement type
            let progress = 0;
            if (xpData) {
              switch (achievement.requirement_type) {
                case "lessons_completed":
                  progress = Math.min((xpData.lessons_completed / achievement.requirement_value) * 100, 100);
                  break;
                case "modules_completed":
                  progress = Math.min((xpData.modules_completed / achievement.requirement_value) * 100, 100);
                  break;
                case "programs_completed":
                  progress = Math.min((xpData.programs_completed / achievement.requirement_value) * 100, 100);
                  break;
                case "streak_days":
                  progress = Math.min((xpData.current_streak / achievement.requirement_value) * 100, 100);
                  break;
                case "account_created":
                  progress = 100; // Auto-unlocked
                  break;
                default:
                  progress = 0;
              }
            }

            return {
              ...achievement,
              isUnlocked,
              unlockedAt: unlockedMap.get(achievement.id) || null,
              progress: isUnlocked ? 100 : progress,
            };
          });

        setAchievements(achievementsWithStatus);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const levelInfo = userXP ? getLevelInfo(userXP.total_xp) : null;

  return {
    achievements,
    userXP,
    levelInfo,
    unlockedCount,
    totalCount,
    isLoading,
  };
}
