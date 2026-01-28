import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, Users, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/data/demo-data";
import { NeonButton } from "@/components/ui/neon-button";

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = "default",
  className,
}) => {
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  if (variant === "compact") {
    return (
      <Link to={`/course/${course.id}`}>
        <div
          className={cn(
            "group glass rounded-xl overflow-hidden hover-lift cursor-pointer",
            className
          )}
        >
          <div className="relative aspect-video overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full backdrop-blur-sm">
                {course.level}
              </span>
              {course.isNew && (
                <span className="px-2 py-1 text-xs font-medium bg-secondary/20 text-secondary rounded-full backdrop-blur-sm">
                  NUEVO
                </span>
              )}
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-background/80 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{course.rating}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{course.instructor.name}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-primary">${course.price}</span>
                {course.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${course.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {course.duration}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link to={`/course/${course.id}`}>
        <div
          className={cn(
            "group glass rounded-2xl overflow-hidden hover-lift cursor-pointer holographic-border",
            className
          )}
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center neon-glow">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {course.isFeatured && (
                <span className="px-3 py-1 text-xs font-heading font-bold bg-gradient-to-r from-primary to-secondary text-white rounded-full">
                  DESTACADO
                </span>
              )}
              {discount > 0 && (
                <span className="px-3 py-1 text-xs font-bold bg-destructive text-white rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
                <div>
                  <p className="text-sm font-medium">{course.instructor.name}</p>
                  <p className="text-xs text-muted-foreground">{course.category}</p>
                </div>
              </div>
              <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {course.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({course.reviewCount.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {course.studentCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {course.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${course.originalPrice}
                    </span>
                  )}
                  <span className="text-2xl font-heading font-bold text-primary">
                    ${course.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/course/${course.id}`}>
      <div
        className={cn(
          "group glass rounded-xl overflow-hidden hover-lift cursor-pointer",
          className
        )}
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center neon-glow">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="px-2 py-1 text-xs font-medium bg-card/80 text-foreground rounded backdrop-blur-sm">
              {course.level}
            </span>
            {course.isNew && (
              <span className="px-2 py-1 text-xs font-bold bg-secondary text-secondary-foreground rounded">
                NUEVO
              </span>
            )}
          </div>

          {discount > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-bold bg-destructive text-white rounded">
                -{discount}%
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-muted-foreground">{course.instructor.name}</span>
          </div>

          <h3 className="font-heading font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <div className="flex items-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <span className="text-muted-foreground">
              ({course.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.studentCount.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-bold text-primary">
                ${course.price}
              </span>
              {course.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${course.originalPrice}
                </span>
              )}
            </div>
            <NeonButton size="sm" variant="outline">
              Ver Curso
              <ChevronRight className="w-4 h-4" />
            </NeonButton>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { CourseCard };
