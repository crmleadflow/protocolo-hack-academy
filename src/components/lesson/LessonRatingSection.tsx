import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RatingSummary } from "@/hooks/useLessonRatings";
import { useAuth } from "@/contexts/AuthContext";

interface LessonRatingSectionProps {
  summary: RatingSummary;
  isSubmitting: boolean;
  onRate: (rating: number) => void;
}

export const LessonRatingSection: React.FC<LessonRatingSectionProps> = ({
  summary,
  isSubmitting,
  onRate,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const { user } = useAuth();

  return (
    <div className="space-y-3">
      {/* Star Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverRating || summary.userRating || 0);
            const isAverage =
              !hoverRating &&
              !summary.userRating &&
              star <= Math.round(summary.averageRating);

            return (
              <button
                key={star}
                onClick={() => onRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={isSubmitting || !user}
                className={cn(
                  "p-1 transition-all duration-200 rounded-full",
                  user && "hover:scale-125 hover:bg-accent",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                aria-label={`Calificar ${star} estrellas`}
              >
                <Star
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200",
                    isFilled
                      ? "fill-amber-400 text-amber-400 drop-shadow-lg"
                      : isAverage
                      ? "fill-amber-400/40 text-amber-400/40"
                      : "text-muted-foreground/30 hover:text-amber-400/60"
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {summary.totalRatings > 0 ? (
            <>
              <span className="font-bold text-lg text-foreground">
                {summary.averageRating}
              </span>
              <span className="text-muted-foreground">
                de 5 · {summary.totalRatings}{" "}
                {summary.totalRatings === 1 ? "voto" : "votos"}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground italic">
              Sé el primero en calificar
            </span>
          )}
        </div>
      </div>

      {/* User's rating indicator */}
      {summary.userRating && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Star className="w-4 h-4 fill-primary" />
          Tu calificación: {summary.userRating}{" "}
          {summary.userRating === 1 ? "estrella" : "estrellas"}
        </div>
      )}
    </div>
  );
};
