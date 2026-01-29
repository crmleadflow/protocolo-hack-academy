import React from "react";
import { Users, Play, DollarSign, MessageSquare, RefreshCw } from "lucide-react";
import { HolographicCard } from "@/components/ui/holographic-card";
import { Button } from "@/components/ui/button";
import type { RecentActivity } from "@/hooks/useRecentActivity";

interface ProducerRecentActivityProps {
  activities: RecentActivity[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const activityIcons = {
  enrollment: { icon: Users, color: "text-primary" },
  completion: { icon: Play, color: "text-secondary" },
  payment: { icon: DollarSign, color: "text-accent" },
  comment: { icon: MessageSquare, color: "text-muted-foreground" },
};

export function ProducerRecentActivity({
  activities,
  isLoading,
  onRefresh,
}: ProducerRecentActivityProps) {
  if (isLoading) {
    return (
      <HolographicCard variant="gradient" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3 pb-4 border-b border-border/50">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </HolographicCard>
    );
  }

  return (
    <HolographicCard variant="gradient" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold">Actividad Reciente</h3>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No hay actividad reciente</p>
          <p className="text-xs mt-1">Las actividades de tus alumnos aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => {
            const { icon: Icon, color } = activityIcons[activity.type] || activityIcons.comment;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Actualizaciones en tiempo real
      </div>
    </HolographicCard>
  );
}
