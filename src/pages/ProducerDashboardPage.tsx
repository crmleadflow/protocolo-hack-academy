import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeonButton } from "@/components/ui/neon-button";
import { HolographicCard } from "@/components/ui/holographic-card";

// Dashboard components
import { ProducerDashboardStats } from "@/components/dashboard/ProducerDashboardStats";
import { ProducerProgramsList } from "@/components/dashboard/ProducerProgramsList";
import { ProducerRecentActivity } from "@/components/dashboard/ProducerRecentActivity";
import { ProducerAnalyticsChart } from "@/components/dashboard/ProducerAnalyticsChart";

// Hooks for real data
import { useProducerAnalytics } from "@/hooks/useProducerAnalytics";
import { usePrograms } from "@/hooks/usePrograms";
import { useRecentActivity } from "@/hooks/useRecentActivity";

const ProducerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch real data
  const { data: analytics, isLoading: analyticsLoading } = useProducerAnalytics();
  const { programs, isLoading: programsLoading } = usePrograms();
  const { activities, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivity(8);

  // Combine programs with enrollment and lesson counts from analytics
  const programsWithStats = useMemo(() => {
    if (!programs || !analytics) return programs;
    
    return programs.map((program) => {
      const programMetric = analytics.programMetrics?.find((pm) => pm.id === program.id);
      return {
        ...program,
        enrollmentCount: programMetric?.enrollments || 0,
        lessonCount: 0,
      };
    });
  }, [programs, analytics]);

  return (
    <AppLayout 
      title="Panel del Productor"
      subtitle="Gestiona tus programas y métricas"
      headerContent={
        <NeonButton onClick={() => navigate("/producer/new-course")}>
          <Plus className="w-4 h-4" />
          Nuevo Programa
        </NeonButton>
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Overview */}
        <ProducerDashboardStats
          totalStudents={analytics?.totalStudents || 0}
          totalEnrollments={analytics?.totalEnrollments || 0}
          totalRevenue={analytics?.totalRevenue || 0}
          averageCompletionRate={analytics?.averageCompletionRate || 0}
          enrollmentGrowth={analytics?.enrollmentGrowth || 0}
          revenueGrowth={analytics?.revenueGrowth || 0}
          isLoading={analyticsLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Programs Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-bold">Mis Programas</h2>
              <NeonButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/producer/courses")}
              >
                Ver todos
              </NeonButton>
            </div>

            <ProducerProgramsList
              programs={programsWithStats || []}
              isLoading={programsLoading}
            />
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-bold">Actividad Reciente</h2>
            <ProducerRecentActivity
              activities={activities}
              isLoading={activitiesLoading}
              onRefresh={refetchActivities}
            />

            {/* Quick Completion Rate Card */}
            <HolographicCard className="text-center">
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                {analytics?.averageCompletionRate || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                Tasa de completación promedio
              </p>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${analytics?.averageCompletionRate || 0}%` }}
                />
              </div>
            </HolographicCard>
          </div>
        </div>

        {/* Analytics Chart */}
        <ProducerAnalyticsChart
          dailyMetrics={analytics?.dailyMetrics || []}
          isLoading={analyticsLoading}
        />
      </div>
    </AppLayout>
  );
};

export default ProducerDashboardPage;
