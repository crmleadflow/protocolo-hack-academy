import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { useNavigate } from "react-router-dom";

interface DailyMetric {
  date: string;
  enrollments: number;
  completedLessons: number;
  revenue: number;
}

interface ProducerAnalyticsChartProps {
  dailyMetrics: DailyMetric[];
  isLoading?: boolean;
}

export function ProducerAnalyticsChart({
  dailyMetrics,
  isLoading,
}: ProducerAnalyticsChartProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <HolographicCard variant="gradient">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-muted/20 animate-pulse" />
      </HolographicCard>
    );
  }

  // Calculate totals for the period
  const totalEnrollments = dailyMetrics.reduce((sum, d) => sum + d.enrollments, 0);
  const totalRevenue = dailyMetrics.reduce((sum, d) => sum + d.revenue, 0);
  const totalCompletions = dailyMetrics.reduce((sum, d) => sum + d.completedLessons, 0);

  const hasData = dailyMetrics.length > 0 && (totalEnrollments > 0 || totalRevenue > 0 || totalCompletions > 0);

  return (
    <HolographicCard variant="gradient">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold">Resumen de Analytics</h2>
          <p className="text-sm text-muted-foreground">Últimos 30 días</p>
        </div>
        <NeonButton variant="outline" size="sm" onClick={() => navigate("/producer/analytics")}>
          <BarChart3 className="w-4 h-4" />
          Ver Analytics Completo
        </NeonButton>
      </div>

      {!hasData ? (
        <div className="h-64 rounded-xl glass flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Sin datos en este período</p>
            <p className="text-xs text-muted-foreground mt-1">
              Las métricas aparecerán cuando tengas inscripciones
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">{totalEnrollments}</p>
              <p className="text-xs text-muted-foreground">Inscripciones</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/10">
              <p className="text-2xl font-bold text-secondary">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Lecciones completadas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/10">
              <p className="text-2xl font-bold text-accent">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Ingresos</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyMetrics}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnrollments)"
                  name="Inscripciones"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Ingresos ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Inscripciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Ingresos</span>
            </div>
          </div>
        </div>
      )}
    </HolographicCard>
  );
}
