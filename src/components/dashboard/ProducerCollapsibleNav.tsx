import React, { useState, createContext, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Menu, Home, BookOpen, Users, BarChart3, 
  DollarSign, Sparkles, MessageSquare, Settings,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProducerNavContextType {
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  closeNav: () => void;
}

const ProducerNavContext = createContext<ProducerNavContextType | null>(null);

export function useProducerNav() {
  const context = useContext(ProducerNavContext);
  if (!context) {
    throw new Error("useProducerNav must be used within a ProducerCollapsibleNav");
  }
  return context;
}

interface ProducerCollapsibleNavProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  currentPath: string;
  onBack?: () => void;
  children?: React.ReactNode;
  stats?: React.ReactNode;
}

const quickLinks = [
  { to: "/producer", icon: Home, label: "Dashboard" },
  { to: "/producer/courses", icon: BookOpen, label: "Programas" },
  { to: "/producer/students", icon: Users, label: "Alumnos" },
  { to: "/producer/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/producer/revenue", icon: DollarSign, label: "Ingresos" },
  { to: "/producer/mentor", icon: Sparkles, label: "Mentor IA" },
  { to: "/producer/messages", icon: MessageSquare, label: "Mensajes" },
  { to: "/producer/settings", icon: Settings, label: "Ajustes" },
];

export function ProducerCollapsibleNav({
  title,
  subtitle,
  icon,
  currentPath,
  onBack,
  children,
  stats,
}: ProducerCollapsibleNavProps) {
  const [isNavOpen, setIsNavOpen] = useState(true);

  const closeNav = useCallback(() => {
    setIsNavOpen(false);
  }, []);

  const handleLinkClick = () => {
    closeNav();
  };

  // Get breadcrumb label from current path
  const getBreadcrumbLabel = () => {
    const link = quickLinks.find(l => l.to === currentPath);
    return link ? link.label : title;
  };

  return (
    <ProducerNavContext.Provider value={{ isNavOpen, setIsNavOpen, closeNav }}>
      <Collapsible open={isNavOpen} onOpenChange={setIsNavOpen}>
        <div className="glass-card rounded-xl p-4">
          {/* Header with Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  title="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              <CollapsibleTrigger asChild>
                <button 
                  className={cn(
                    "p-2 rounded-lg border border-border/50 transition-all",
                    isNavOpen 
                      ? "bg-secondary/20 border-secondary/50 text-secondary" 
                      : "hover:bg-muted/50"
                  )}
                  title={isNavOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </CollapsibleTrigger>
              
              <div className="flex items-center gap-3">
                {icon}
                <div className="text-left">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-gradient">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground hidden md:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            {stats}
          </div>

          {/* Collapsible Navigation Content */}
          <CollapsibleContent className="mt-4">
            <div className="border-t border-border/50 pt-4 space-y-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Link 
                  to="/producer" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Panel</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium flex items-center gap-1">
                  {icon}
                  {getBreadcrumbLabel()}
                </span>
              </div>

              {/* Quick Navigation Links */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg transition-colors",
                      currentPath === link.to
                        ? "bg-secondary/20 border border-secondary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <link.icon className={cn(
                      "w-5 h-5",
                      currentPath === link.to ? "text-secondary" : "text-primary"
                    )} />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Additional children content */}
              {children}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </ProducerNavContext.Provider>
  );
}

// Hook for child components to trigger nav close when they perform actions
export function useCloseProducerNav() {
  const context = useContext(ProducerNavContext);
  return context?.closeNav || (() => {});
}
