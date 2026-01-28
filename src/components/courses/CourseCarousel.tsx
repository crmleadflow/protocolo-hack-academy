import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/data/demo-data";
import { CourseCard } from "@/components/courses/CourseCard";
import { NeonButton } from "@/components/ui/neon-button";

interface CourseCarouselProps {
  title: string;
  subtitle?: string;
  courses: Course[];
  variant?: "default" | "compact" | "featured";
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const CourseCarousel: React.FC<CourseCarouselProps> = ({
  title,
  subtitle,
  courses,
  variant = "default",
  showViewAll = true,
  onViewAll,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const cardWidth = variant === "featured" ? "min-w-[600px]" : variant === "compact" ? "min-w-[280px]" : "min-w-[320px]";

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full glass hover:bg-primary/20 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full glass hover:bg-primary/20 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {showViewAll && (
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="ml-2"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </NeonButton>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-holographic scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {courses.map((course) => (
          <div key={course.id} className={cn("flex-shrink-0", cardWidth)}>
            <CourseCard course={course} variant={variant} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { CourseCarousel };
