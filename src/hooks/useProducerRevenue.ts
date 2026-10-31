import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, eachMonthOfInterval, subDays } from "date-fns";
import { es } from "date-fns/locale";

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  programTitle: string;
  programId: string;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  paypalOrderId: string | null;
}

export interface RevenueByProgram {
  programId: string;
  programTitle: string;
  totalRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  percentageOfTotal: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  transactions: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}

export interface RevenueData {
  // Summary metrics
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  
  // Period comparisons
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueLast30Days: number;
  revenuePrevious30Days: number;
  revenueGrowthMonth: number;
  revenueGrowth30Days: number;
  
  transactionsThisMonth: number;
  transactionsLastMonth: number;
  transactionGrowth: number;
  
  // Time series
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  
  // Breakdowns
  revenueByProgram: RevenueByProgram[];
  
  // Recent transactions
  recentTransactions: Transaction[];
  
  // All transactions for filtering
  allTransactions: Transaction[];
}

export function useProducerRevenue() {
  return useQuery({
    queryKey: ["producer-revenue"],
    queryFn: async (): Promise<RevenueData> => {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const thirtyDaysAgo = subDays(now, 30);
      const sixtyDaysAgo = subDays(now, 60);
      const sixMonthsAgo = subMonths(now, 6);

      // Fetch payments with related data
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch programs for titles
      const { data: programs } = await supabase
        .from("programs")
        .select("id, title");

      // Fetch profiles for student names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      const programMap = new Map(programs?.map(p => [p.id, p.title]) || []);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      // Transform payments to transactions
      const allTransactions: Transaction[] = (payments || []).map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        programTitle: programMap.get(payment.program_id) || "Programa desconocido",
        programId: payment.program_id,
        studentName: profileMap.get(payment.user_id) || "Usuario",
        studentEmail: "", // Would need auth.users access
        createdAt: payment.created_at,
        paypalOrderId: payment.paypal_order_id,
      }));

      // Calculate totals
      const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalTransactions = allTransactions.length;
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // This month revenue
      const transactionsThisMonth = allTransactions.filter(t => {
        const date = new Date(t.createdAt);
        return date >= thisMonthStart && date <= thisMonthEnd;
      });
      const revenueThisMonth = transactionsThisMonth.reduce((sum, t) => sum + t.amount, 0);

      // Last month revenue
      const transactionsLastMonth = allTransactions.filter(t => {
        const date = new Date(t.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });
      const revenueLastMonth = transactionsLastMonth.reduce((sum, t) => sum + t.amount, 0);

      // Last 30 days revenue
      const transactionsLast30Days = allTransactions.filter(t => {
        const date = new Date(t.createdAt);
        return date >= thirtyDaysAgo;
      });
      const revenueLast30Days = transactionsLast30Days.reduce((sum, t) => sum + t.amount, 0);

      // Previous 30 days (30-60 days ago)
      const transactionsPrevious30Days = allTransactions.filter(t => {
        const date = new Date(t.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      });
      const revenuePrevious30Days = transactionsPrevious30Days.reduce((sum, t) => sum + t.amount, 0);

      // Calculate growth rates
      const revenueGrowthMonth = revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
        : revenueThisMonth > 0 ? 100 : 0;

      const revenueGrowth30Days = revenuePrevious30Days > 0
        ? Math.round(((revenueLast30Days - revenuePrevious30Days) / revenuePrevious30Days) * 100)
        : revenueLast30Days > 0 ? 100 : 0;

      const transactionGrowth = transactionsLastMonth.length > 0
        ? Math.round(((transactionsThisMonth.length - transactionsLastMonth.length) / transactionsLastMonth.length) * 100)
        : transactionsThisMonth.length > 0 ? 100 : 0;

      // Daily revenue for last 30 days
      const daysLast30 = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
      const dailyRevenue: DailyRevenue[] = daysLast30.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayTransactions = allTransactions.filter(
          t => format(new Date(t.createdAt), "yyyy-MM-dd") === dayStr
        );
        return {
          date: format(day, "dd MMM", { locale: es }),
          revenue: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: dayTransactions.length,
        };
      });

      // Monthly revenue for last 6 months
      const monthsLast6 = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
      const monthlyRevenue: MonthlyRevenue[] = monthsLast6.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthTransactions = allTransactions.filter(t => {
          const date = new Date(t.createdAt);
          return date >= monthStart && date <= monthEnd;
        });
        return {
          month: format(month, "MMM yyyy", { locale: es }),
          revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: monthTransactions.length,
        };
      });

      // Revenue by program
      const programRevenueMap = new Map<string, { revenue: number; count: number }>();
      allTransactions.forEach(t => {
        const existing = programRevenueMap.get(t.programId) || { revenue: 0, count: 0 };
        programRevenueMap.set(t.programId, {
          revenue: existing.revenue + t.amount,
          count: existing.count + 1,
        });
      });

      const revenueByProgram: RevenueByProgram[] = Array.from(programRevenueMap.entries())
        .map(([programId, data]) => ({
          programId,
          programTitle: programMap.get(programId) || "Programa desconocido",
          totalRevenue: data.revenue,
          transactionCount: data.count,
          averageTransaction: data.count > 0 ? data.revenue / data.count : 0,
          percentageOfTotal: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Recent transactions (last 10)
      const recentTransactions = allTransactions.slice(0, 10);

      return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        revenueThisMonth,
        revenueLastMonth,
        revenueLast30Days,
        revenuePrevious30Days,
        revenueGrowthMonth,
        revenueGrowth30Days,
        transactionsThisMonth: transactionsThisMonth.length,
        transactionsLastMonth: transactionsLastMonth.length,
        transactionGrowth,
        dailyRevenue,
        monthlyRevenue,
        revenueByProgram,
        recentTransactions,
        allTransactions,
      };
    },
  });
}
