import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, Users, BarChart3, Settings, LogOut,
  Plus, FileVideo, DollarSign, MessageSquare, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/producer", icon: LayoutDashboard },
  { title: "Mis Programas", url: "/producer/courses", icon: BookOpen },
  { title: "Alumnos", url: "/producer/students", icon: Users },
  { title: "Analytics", url: "/producer/analytics", icon: BarChart3 },
  { title: "Ingresos", url: "/producer/revenue", icon: DollarSign },
];

const secondaryItems = [
  { title: "Crear Programa", url: "/producer/new-course", icon: Plus },
  { title: "Subir Contenido", url: "/producer/courses", icon: FileVideo },
  { title: "Mentor IA", url: "/producer/mentor", icon: Sparkles },
  { title: "Mensajes", url: "/producer/messages", icon: MessageSquare },
  { title: "Configuración", url: "/producer/settings", icon: Settings },
];

export function ProducerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-border/50 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Protocolo Hack" className="h-8 w-8 object-contain" />
          {!collapsed && (
            <div>
              <span className="font-heading font-bold text-lg text-gradient">
                Protocolo Hack
              </span>
              <p className="text-xs text-muted-foreground">Panel Productor</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Menu */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Gestión</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                        isActive(item.url) 
                          ? "bg-secondary/20 text-secondary neon-glow-purple" 
                          : "hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Actions */}
        <SidebarGroup className="mt-6">
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Acciones</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                        isActive(item.url) 
                          ? "bg-secondary/20 text-secondary" 
                          : "hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        {/* Producer info */}
        <div className={cn(
          "flex items-center gap-3 mb-4",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
            <span className="font-heading font-bold text-secondary-foreground">
              HG
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Hector Galensky</p>
              <p className="text-xs text-muted-foreground">Productor</p>
            </div>
          )}
        </div>

        {/* Switch to Student View */}
        <button 
          onClick={() => navigate("/dashboard")}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all mb-2",
            collapsed && "justify-center"
          )}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Vista Alumno</span>}
        </button>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
