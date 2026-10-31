import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route configuration for admin breadcrumbs
const routeConfig: Record<string, { label: string; parent?: string }> = {
  "/producer": { label: "Dashboard" },
  "/producer/courses": { label: "Programas", parent: "/producer" },
  "/producer/course": { label: "Editar Programa", parent: "/producer/courses" },
  "/producer/students": { label: "Alumnos", parent: "/producer" },
  "/producer/analytics": { label: "Analytics", parent: "/producer" },
  "/producer/revenue": { label: "Ingresos", parent: "/producer" },
  "/producer/new-course": { label: "Nuevo Programa", parent: "/producer/courses" },
  "/producer/mentor": { label: "Mi Mentor IA", parent: "/producer" },
  "/producer/messages": { label: "Mensajes", parent: "/producer" },
  "/producer/settings": { label: "Configuración", parent: "/producer" },
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Find the matching route (handle dynamic segments like /producer/course/:id/edit)
  let matchedRoute: string | null = null;
  let currentPath = pathname;
  
  // Try exact match first
  if (routeConfig[pathname]) {
    matchedRoute = pathname;
  } else {
    // Try pattern matching for dynamic routes
    for (const route of Object.keys(routeConfig)) {
      if (pathname.startsWith(route + "/")) {
        matchedRoute = route;
        break;
      }
    }
  }
  
  if (!matchedRoute) {
    // Default: just show admin dashboard
    return [{ label: "Panel Admin", href: "/producer" }];
  }
  
  // Build breadcrumb chain from parent to current
  const chain: string[] = [];
  let route: string | undefined = matchedRoute;
  
  while (route) {
    chain.unshift(route);
    route = routeConfig[route]?.parent;
  }
  
  // Convert to breadcrumb items
  for (let i = 0; i < chain.length; i++) {
    const routePath = chain[i];
    const config = routeConfig[routePath];
    const isLast = i === chain.length - 1;
    
    breadcrumbs.push({
      label: config.label,
      href: isLast ? undefined : routePath,
    });
  }
  
  return breadcrumbs;
}

export function AdminBreadcrumbs() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  
  // Don't show breadcrumbs on main dashboard
  if (location.pathname === "/producer") {
    return null;
  }
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
    >
      <Link 
        to="/producer" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only md:not-sr-only">Panel</span>
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {item.href ? (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors truncate max-w-[120px] md:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "text-foreground font-medium truncate max-w-[150px] md:max-w-none"
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
