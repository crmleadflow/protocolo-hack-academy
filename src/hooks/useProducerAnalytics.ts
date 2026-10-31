import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";

interface DailyMetric {
  date: string;
  enrollments: number;
  completedLessons: number;
  revenue: number;
}

interface ProgramMetric {
  id: string;
  title: string;
  enrollments: number;
  completedLessons: number;
  revenue: number;
}

interface AnalyticsData {
  // Summary metrics
  totalStudents: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalRevenue: number;
  totalPrograms: number;
  totalLessons: number;
  completedLessons: number;
  averageCompletionRate: number;
  
  // Growth metrics
  newEnrollmentsThisMonth: number;
  newEnrollmentsLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  enrollmentGrowth: number;
  revenueGrowth: number;
  
  // Time series data
  dailyMetrics: DailyMetric[];
  weeklyEnrollments: { day: string; count: number }[];
  
  // Program breakdown
  programMetrics: ProgramMetric[];
  
  // Top performers
  topPrograms: { title: string; enrollments: number }[];
}

export function useProducerAnalytics() {
  return useQuery({
    queryKey: ["producer-analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // Fetch all data in parallel
      const [
        enrollmentsResult,
        programsResult,
        lessonsResult,
        lessonProgressResult,
        paymentsResult,
      ] = await Promise.all([
        supabase.from("enrollments").select("*"),
        supabase.from("programs").select("id, title, price, is_published"),
        supabase.from("lessons").select("id, module_id"),
        supabase.from("lesson_progress").select("*"),
        supabase.from("payments").select("*").eq("status", "completed"),
      ]);

      const enrollments = enrollmentsResult.data || [];
      const programs = programsResult.data || [];
      const lessons = lessonsResult.data || [];
      const lessonProgress = lessonProgressResult.data || [];
      const payments = paymentsResult.data || [];

      // Calculate unique students
      const uniqueStudentIds = new Set(enrollments.map((e) => e.user_id));
      const totalStudents = uniqueStudentIds.size;

      // Calculate enrollment metrics
      const activeEnrollments = enrollments.filter((e) => e.status === "active").length;
      const totalEnrollments = enrollments.length;

      // Calculate revenue
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate lesson completion
      const completedLessons = lessonProgress.filter((lp) => lp.completed).length;
      const totalLessons = lessons.length;
      const averageCompletionRate = totalLessons > 0 
        ? Math.round((completedLessons / (totalLessons * Math.max(totalStudents, 1))) * 100)
        : 0;

      // This month enrollments
      const enrollmentsThisMonth = enrollments.filter((e) => {
        const date = new Date(e.created_at);
        return date >= thisMonthStart && date <= thisMonthEnd;
      });
      const newEnrollmentsThisMonth = enrollmentsThisMonth.length;

      // Last month enrollments
      const enrollmentsLastMonth = enrollments.filter((e) => {
        const date = new Date(e.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });
      const newEnrollmentsLastMonth = enrollmentsLastMonth.length;

      // This month revenue
      const paymentsThisMonth = payments.filter((p) => {
        const date = new Date(p.created_at);
        return date >= thisMonthStart && date <= thisMonthEnd;
      });
      const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);

      // Last month revenue
      const paymentsLastMonth = payments.filter((p) => {
        const date = new Date(p.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });
      const revenueLastMonth = paymentsLastMonth.reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate growth rates
      const enrollmentGrowth = newEnrollmentsLastMonth > 0
        ? Math.round(((newEnrollmentsThisMonth - newEnrollmentsLastMonth) / newEnrollmentsLastMonth) * 100)
        : newEnrollmentsThisMonth > 0 ? 100 : 0;

      const revenueGrowth = revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
        : revenueThisMonth > 0 ? 100 : 0;

      // Daily metrics for the current month
      const daysInMonth = eachDayOfInterval({ start: thisMonthStart, end: now });
      const dailyMetrics: DailyMetric[] = daysInMonth.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayEnrollments = enrollments.filter(
          (e) => format(new Date(e.created_at), "yyyy-MM-dd") === dayStr
        ).length;
        const dayCompletedLessons = lessonProgress.filter(
          (lp) => lp.completed && lp.completed_at && format(new Date(lp.completed_at), "yyyy-MM-dd") === dayStr
        ).length;
        const dayRevenue = payments
          .filter((p) => format(new Date(p.created_at), "yyyy-MM-dd") === dayStr)
          .reduce((sum, p) => sum + Number(p.amount), 0);

        return {
          date: format(day, "dd MMM"),
          enrollments: dayEnrollments,
          completedLessons: dayCompletedLessons,
          revenue: dayRevenue,
        };
      });

      // Weekly enrollments
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const weeklyEnrollments = daysOfWeek.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const count = enrollments.filter(
          (e) => format(new Date(e.created_at), "yyyy-MM-dd") === dayStr
        ).length;
        return {
          day: format(day, "EEE"),
          count,
        };
      });

      // Program metrics
      const programMetrics: ProgramMetric[] = programs.map((program) => {
        const programEnrollments = enrollments.filter((e) => e.program_id === program.id);
        const programPayments = payments.filter((p) => p.program_id === program.id);
        const programRevenue = programPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
          id: program.id,
          title: program.title,
          enrollments: programEnrollments.length,
          completedLessons: 0, // Would need module->lesson mapping
          revenue: programRevenue,
        };
      });

      // Top programs by enrollments
      const topPrograms = [...programMetrics]
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5)
        .map((p) => ({ title: p.title, enrollments: p.enrollments }));

      return {
        totalStudents,
        totalEnrollments,
        activeEnrollments,
        totalRevenue,
        totalPrograms: programs.length,
        totalLessons,
        completedLessons,
        averageCompletionRate: Math.min(averageCompletionRate, 100),
        newEnrollmentsThisMonth,
        newEnrollmentsLastMonth,
        revenueThisMonth,
        revenueLastMonth,
        enrollmentGrowth,
        revenueGrowth,
        dailyMetrics,
        weeklyEnrollments,
        programMetrics,
        topPrograms,
      };
    },
  });
}
