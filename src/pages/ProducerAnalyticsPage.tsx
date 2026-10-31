import React from "react";
import { 
  Users, TrendingUp, DollarSign, BookOpen, 
  BarChart3, Play, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { StatCard } from "@/components/ui/stat-card";
import { useProducerAnalytics } from "@/hooks/useProducerAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

const chartConfig = {
  enrollments: {
    label: "Inscripciones",
    color: "hsl(var(--primary))",
  },
  completedLessons: {
    label: "Lecciones Completadas",
    color: "hsl(var(--secondary))",
  },
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--accent))",
  },
  count: {
    label: "Cantidad",
    color: "hsl(var(--primary))",
  },
};

const ProducerAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading } = useProducerAnalytics();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <UnifiedSidebar />
          <FloatingSidebarTrigger />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <Skeleton className="h-24 rounded-xl" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const pieData = analytics?.topPrograms.map((p, index) => ({
    name: p.title.length > 20 ? p.title.substring(0, 20) + "..." : p.title,
    value: p.enrollments,
    fill: COLORS[index % COLORS.length],
  })) || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedSidebar />
        <FloatingSidebarTrigger />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-8">
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Alumnos"
                value={analytics?.totalStudents.toLocaleString() || "0"}
                subtitle={`${analytics?.activeEnrollments || 0} inscripciones activas`}
                icon={Users}
                color="primary"
              />
              <StatCard
                title="Inscripciones Este Mes"
                value={analytics?.newEnrollmentsThisMonth.toLocaleString() || "0"}
                subtitle={
                  analytics?.enrollmentGrowth !== undefined
                    ? `${analytics.enrollmentGrowth >= 0 ? "+" : ""}${analytics.enrollmentGrowth}% vs mes anterior`
                    : undefined
                }
                icon={TrendingUp}
                color="secondary"
                trend={analytics?.enrollmentGrowth && analytics.enrollmentGrowth >= 0 ? "up" : "down"}
              />
              <StatCard
                title="Ingresos Este Mes"
                value={`$${(analytics?.revenueThisMonth || 0).toLocaleString()}`}
                subtitle={
                  analytics?.revenueGrowth !== undefined
                    ? `${analytics.revenueGrowth >= 0 ? "+" : ""}${analytics.revenueGrowth}% vs mes anterior`
                    : undefined
                }
                icon={DollarSign}
                color="accent"
                trend={analytics?.revenueGrowth && analytics.revenueGrowth >= 0 ? "up" : "down"}
              />
              <StatCard
                title="Tasa de Completación"
                value={`${analytics?.averageCompletionRate || 0}%`}
                subtitle={`${analytics?.completedLessons || 0} lecciones completadas`}
                icon={Play}
                color="primary"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Ingresos"
                value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`}
                subtitle="Todos los tiempos"
                icon={DollarSign}
                color="accent"
              />
              <StatCard
                title="Total Inscripciones"
                value={analytics?.totalEnrollments.toLocaleString() || "0"}
                subtitle="Todos los tiempos"
                icon={Users}
                color="primary"
              />
              <StatCard
                title="Programas"
                value={analytics?.totalPrograms.toLocaleString() || "0"}
                subtitle="Publicados"
                icon={BookOpen}
                color="secondary"
              />
              <StatCard
                title="Lecciones"
                value={analytics?.totalLessons.toLocaleString() || "0"}
                subtitle="Total disponibles"
                icon={Play}
                color="primary"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Enrollments Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Inscripciones Diarias
                  </h3>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                </div>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={analytics?.dailyMetrics || []}>
                      <defs>
                        <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="enrollments"
                        stroke="hsl(var(--primary))"
                        fill="url(#enrollmentGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </HolographicCard>

              {/* Daily Revenue Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    Ingresos Diarios
                  </h3>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                </div>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={analytics?.dailyMetrics || []}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--accent))"
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </HolographicCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Weekly Bar Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg">Inscripciones de la Semana</h3>
                  <p className="text-sm text-muted-foreground">Por día</p>
                </div>
                <div className="h-48">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={analytics?.weeklyEnrollments || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </HolographicCard>

              {/* Lesson Completion Line Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg">Lecciones Completadas</h3>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                </div>
                <div className="h-48">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={analytics?.dailyMetrics || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="completedLessons"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </HolographicCard>

              {/* Top Programs Pie Chart */}
              <HolographicCard variant="gradient">
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg">Top Programas</h3>
                  <p className="text-sm text-muted-foreground">Por inscripciones</p>
                </div>
                <div className="h-48">
                  {pieData.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sin datos disponibles
                    </div>
                  )}
                </div>
              </HolographicCard>
            </div>

            {/* Programs Table */}
            <HolographicCard variant="gradient">
              <div className="mb-4">
                <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  Rendimiento por Programa
                </h3>
                <p className="text-sm text-muted-foreground">Métricas detalladas</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Programa</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Inscripciones</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ingresos</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.programMetrics.map((program) => {
                      const percentage = analytics.totalEnrollments > 0
                        ? Math.round((program.enrollments / analytics.totalEnrollments) * 100)
                        : 0;
                      return (
                        <tr key={program.id} className="border-b border-border/30 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <span className="font-medium">{program.title}</span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="text-primary font-semibold">{program.enrollments}</span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="text-accent font-semibold">${program.revenue.toLocaleString()}</span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {(!analytics?.programMetrics || analytics.programMetrics.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No hay programas para mostrar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </HolographicCard>

            {/* Growth Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <HolographicCard className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {(analytics?.enrollmentGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-8 h-8 text-destructive" />
                  )}
                  <span className={`text-4xl font-heading font-bold ${
                    (analytics?.enrollmentGrowth || 0) >= 0 ? "text-primary" : "text-destructive"
                  }`}>
                    {analytics?.enrollmentGrowth || 0}%
                  </span>
                </div>
                <p className="text-muted-foreground">Crecimiento de Inscripciones</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics?.newEnrollmentsThisMonth || 0} este mes vs {analytics?.newEnrollmentsLastMonth || 0} mes anterior
                </p>
              </HolographicCard>

              <HolographicCard className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {(analytics?.revenueGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-8 h-8 text-destructive" />
                  )}
                  <span className={`text-4xl font-heading font-bold ${
                    (analytics?.revenueGrowth || 0) >= 0 ? "text-primary" : "text-destructive"
                  }`}>
                    {analytics?.revenueGrowth || 0}%
                  </span>
                </div>
                <p className="text-muted-foreground">Crecimiento de Ingresos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${analytics?.revenueThisMonth?.toLocaleString() || 0} este mes vs ${analytics?.revenueLastMonth?.toLocaleString() || 0} mes anterior
                </p>
              </HolographicCard>
            </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerAnalyticsPage;
