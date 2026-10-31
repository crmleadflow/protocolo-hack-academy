import React from "react";
import { Users, Eye, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface ProducerDashboardStatsProps {
  totalStudents: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageCompletionRate: number;
  enrollmentGrowth: number;
  revenueGrowth: number;
  isLoading?: boolean;
}

export function ProducerDashboardStats({
  totalStudents,
  totalEnrollments,
  totalRevenue,
  averageCompletionRate,
  enrollmentGrowth,
  revenueGrowth,
  isLoading,
}: ProducerDashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-card/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Alumnos"
        value={totalStudents.toLocaleString()}
        subtitle={
          enrollmentGrowth > 0
            ? `+${enrollmentGrowth}% este mes`
            : enrollmentGrowth < 0
            ? `${enrollmentGrowth}% este mes`
            : "Sin cambios"
        }
        icon={Users}
        color="primary"
        trend={enrollmentGrowth > 0 ? "up" : enrollmentGrowth < 0 ? "down" : undefined}
      />
      <StatCard
        title="Inscripciones"
        value={totalEnrollments.toLocaleString()}
        subtitle="inscripciones totales"
        icon={Eye}
        color="secondary"
      />
      <StatCard
        title="Ingresos"
        value={`$${totalRevenue.toLocaleString()}`}
        subtitle={
          revenueGrowth > 0
            ? `+${revenueGrowth}% este mes`
            : revenueGrowth < 0
            ? `${revenueGrowth}% este mes`
            : "Sin cambios"
        }
        icon={DollarSign}
        color="accent"
        trend={revenueGrowth > 0 ? "up" : revenueGrowth < 0 ? "down" : undefined}
      />
      <StatCard
        title="Tasa Completación"
        value={`${averageCompletionRate}%`}
        subtitle="promedio de cursos"
        icon={Clock}
        color="primary"
      />
    </div>
  );
}
