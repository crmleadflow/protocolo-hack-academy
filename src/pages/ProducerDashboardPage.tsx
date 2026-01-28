import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Play, TrendingUp, DollarSign, Eye, Clock,
  Plus, Settings, BarChart3, FileVideo, ChevronRight
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/dashboard/ProducerSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { StatCard } from "@/components/ui/stat-card";
import { demoCourses } from "@/data/demo-data";

// Demo analytics data
const analyticsData = {
  totalStudents: 12847,
  totalViews: 89432,
  totalRevenue: 245800,
  avgWatchTime: 34,
  growthRate: 23.5,
  completionRate: 67,
};

const recentActivity = [
  { id: 1, type: "enrollment", message: "Nuevo alumno en Protocolo Hack", time: "Hace 5 min" },
  { id: 2, type: "completion", message: "María G. completó Neuro Talk", time: "Hace 15 min" },
  { id: 3, type: "review", message: "Nueva reseña 5⭐ en Closer Project", time: "Hace 1 hora" },
  { id: 4, type: "enrollment", message: "3 nuevos alumnos en IA para tu Negocio", time: "Hace 2 horas" },
];

const ProducerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const courses = demoCourses;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProducerSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-heading font-bold">
                    Panel del Productor
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tus programas y métricas
                  </p>
                </div>
              </div>
              <NeonButton onClick={() => navigate("/producer/new-course")}>
                <Plus className="w-4 h-4" />
                Nuevo Programa
              </NeonButton>
            </div>
          </header>

          <div className="p-6 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Alumnos"
                value={analyticsData.totalStudents.toLocaleString()}
                subtitle={`+${analyticsData.growthRate}% este mes`}
                icon={Users}
                color="primary"
                trend="up"
              />
              <StatCard
                title="Visualizaciones"
                value={analyticsData.totalViews.toLocaleString()}
                subtitle="últimos 30 días"
                icon={Eye}
                color="secondary"
              />
              <StatCard
                title="Ingresos"
                value={`$${(analyticsData.totalRevenue / 1000).toFixed(1)}K`}
                subtitle="este mes"
                icon={DollarSign}
                color="accent"
                trend="up"
              />
              <StatCard
                title="Tiempo Promedio"
                value={`${analyticsData.avgWatchTime}min`}
                subtitle="por sesión"
                icon={Clock}
                color="primary"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Courses Management */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold">Mis Programas</h2>
                  <NeonButton variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4" />
                  </NeonButton>
                </div>

                <div className="space-y-4">
                  {courses.slice(0, 4).map((course) => (
                    <HolographicCard
                      key={course.id}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <course.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold truncate">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {Math.floor(Math.random() * 2000 + 500)} alumnos
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {course.totalLessons} lecciones
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg glass hover:bg-white/5 transition-colors">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg glass hover:bg-white/5 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </HolographicCard>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-4">
                <h2 className="text-xl font-heading font-bold">Actividad Reciente</h2>
                <HolographicCard variant="gradient" className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {activity.type === "enrollment" && <Users className="w-4 h-4 text-primary" />}
                        {activity.type === "completion" && <Play className="w-4 h-4 text-secondary" />}
                        {activity.type === "review" && <TrendingUp className="w-4 h-4 text-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </HolographicCard>

                {/* Quick Stats */}
                <HolographicCard className="text-center">
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    {analyticsData.completionRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tasa de completación promedio
                  </p>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${analyticsData.completionRate}%` }}
                    />
                  </div>
                </HolographicCard>
              </div>
            </div>

            {/* Analytics Preview */}
            <HolographicCard variant="gradient">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-heading font-bold">Resumen de Analytics</h2>
                  <p className="text-sm text-muted-foreground">Últimos 30 días</p>
                </div>
                <NeonButton variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4" />
                  Ver Analytics Completo
                </NeonButton>
              </div>
              
              {/* Placeholder for chart */}
              <div className="h-48 rounded-xl glass flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Gráfico de métricas</p>
                </div>
              </div>
            </HolographicCard>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProducerDashboardPage;
