import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Clock, BookOpen, Search, Filter, ChevronRight,
  Zap, Target, Mic, Bot, Video, Crown, Package
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { demoCourses } from "@/data/demo-data";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Todos", icon: BookOpen },
  { id: "ventas", label: "Ventas", icon: Target },
  { id: "marketing", label: "Marketing", icon: Video },
  { id: "ia", label: "IA & Tech", icon: Bot },
  { id: "mindset", label: "Mindset", icon: Zap },
];

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const courses = demoCourses;

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-heading font-bold">
                    Arsenal de Entrenamiento
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {courses.length} programas disponibles
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <GlassInput
                  type="text"
                  placeholder="Buscar programas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "glass hover:bg-white/5"
                    )}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <HolographicCard
                  key={course.id}
                  variant={course.featured ? "gradient" : "default"}
                  className="group cursor-pointer animate-fade-in flex flex-col"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      course.color === "primary" && "bg-primary/20",
                      course.color === "secondary" && "bg-secondary/20",
                      course.color === "accent" && "bg-accent/20"
                    )}>
                      <course.icon className={cn(
                        "w-7 h-7",
                        course.color === "primary" && "text-primary",
                        course.color === "secondary" && "text-secondary",
                        course.color === "accent" && "text-accent"
                      )} />
                    </div>
                    {course.progress > 0 && (
                      <ProgressRing progress={course.progress} size={48} strokeWidth={3}>
                        <span className="text-xs font-bold">{course.progress}%</span>
                      </ProgressRing>
                    )}
                    {course.featured && course.progress === 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                        Destacado
                      </span>
                    )}
                  </div>

                  {/* Course Info */}
                  <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {course.totalLessons} lecciones
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Progress bar for in-progress courses */}
                  {course.progress > 0 && course.progress < 100 && (
                    <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  )}
                </HolographicCard>
              ))}
            </div>

            {/* Empty state */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-heading font-bold mb-2">No se encontraron programas</h3>
                <p className="text-muted-foreground">
                  Intenta con otros términos de búsqueda o categoría
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CatalogPage;
