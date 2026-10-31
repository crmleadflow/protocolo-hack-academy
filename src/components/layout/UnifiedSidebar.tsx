import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BookOpen, Trophy, Settings, LogOut, User,
  Zap, MessageSquare, HelpCircle, Shield, Sparkles, Brain, PanelLeft,
  LayoutDashboard, Users, BarChart3, DollarSign, Plus, FileVideo, Mail
} from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Student menu items
const studentSections = [
  {
    label: "Menú Principal",
    items: [
      { title: "Inicio", url: "/", icon: Home },
      { title: "Mi panel", url: "/dashboard", icon: LayoutDashboard },
      { title: "Academia", url: "/catalog", icon: BookOpen },
      { title: "Comunidad", url: "/community", icon: MessageSquare },
      { title: "Mensajes", url: "/messages", icon: Mail, hasBadge: true },
      { title: "Logros", url: "/achievements", icon: Trophy },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { title: "Marketplace", url: "/marketplace", icon: DollarSign },
      { title: "Mentorías", url: "/mentorias", icon: Users },
      { title: "Conferencias", url: "/conferencias", icon: Users },
      { title: "Seminarios", url: "/seminarios", icon: Users },
      { title: "Capacitaciones", url: "/capacitaciones", icon: Users },
      { title: "Eventos", url: "/eventos", icon: Users },
      { title: "Bootcamp", url: "/bootcamp", icon: Users },
    ],
  },
  {
    label: "Recursos · Herramientas",
    items: [
      { title: "Neuro Analyzer Pro", url: "/neuro-scanner", icon: Brain },
      { title: "Mi Mentor IA", url: "/mentor", icon: Sparkles },
    ],
  },
];

// Admin/Producer menu items
const adminMenuItems = [
  { title: "Dashboard", url: "/producer", icon: LayoutDashboard },
  { title: "Mis Programas", url: "/producer/courses", icon: BookOpen },
  { title: "Alumnos", url: "/producer/students", icon: Users },
  { title: "Miembros", url: "/producer/members", icon: Users },
  { title: "Oportunidades", url: "/producer/leads", icon: BarChart3 },
  { title: "Analytics", url: "/producer/analytics", icon: BarChart3 },
  { title: "Ingresos", url: "/producer/revenue", icon: DollarSign },
];

// Admin secondary items
const adminSecondaryItems = [
  { title: "Crear Programa", url: "/producer/new-course", icon: Plus },
  { title: "Mi Mentor IA", url: "/producer/mentor", icon: Sparkles },
  { title: "Mensajes", url: "/producer/messages", icon: MessageSquare },
  { title: "Configuración", url: "/producer/settings", icon: Settings },
];

// Account items (shared)
const accountItems = [
  { title: "Mi Perfil", url: "/profile", icon: User },
  { title: "Configuración", url: "/settings", icon: Settings },
  { title: "Ayuda", url: "/help", icon: HelpCircle },
];

export function UnifiedSidebar() {
  const { state, setOpenMobile, toggleSidebar, isMobile: isMobileSidebar } = useSidebar();
  // En móvil, forzar expansión para mejor UX (no colapsar iconos)
  const collapsed = isMobileSidebar ? false : state === "collapsed";
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, signOut } = useAuth();
  const { profile, displayName, initials } = useProfile();
  const { unreadCount } = useDirectMessages();

  // Determine if we're in admin/producer section
  const isProducerSection = location.pathname.startsWith("/producer");

  const isActive = (path: string) => {
    if (path === "/producer" && location.pathname === "/producer") return true;
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/producer" && path !== "/dashboard") {
      return location.pathname.startsWith(path);
    }
    return false;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    handleLinkClick();
    await signOut();
    navigate("/");
  };

  const handleSwitchContext = () => {
    handleLinkClick();
    if (isProducerSection) {
      navigate("/dashboard");
    } else {
      navigate("/producer");
    }
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
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="font-heading font-bold text-lg text-gradient">
              {collapsed ? "PH" : "PROTOCOLO HACK"}
            </span>
          </div>

          {!isMobile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              title={collapsed ? "Expandir menú" : "Colapsar menú"}
              className={cn(
                "p-2 rounded-lg border border-border/50 transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-white/5",
                collapsed && "mx-auto"
              )}
            >
              <PanelLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Context Switcher - Only for admins */}
        {isAdmin && (
          <button 
            onClick={handleSwitchContext}
            className={cn(
              "flex items-center gap-2 mt-4 px-3 py-2 rounded-lg w-full border transition-all",
              isProducerSection 
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20",
              collapsed && "justify-center px-2"
            )}
            title={isProducerSection ? "Ir a Vista Alumno" : "Ir a Panel Admin"}
          >
            {isProducerSection ? (
              <>
                <Home className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Vista Alumno</span>}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Panel Admin</span>}
              </>
            )}
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {isProducerSection ? (
          // Admin/Producer Navigation
          <>
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Gestión</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          onClick={handleLinkClick}
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

            <SidebarGroup className="mt-4">
              {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Acciones</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminSecondaryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          onClick={handleLinkClick}
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
          </>
        ) : (
          // Student Navigation
          <>
            {studentSections.map((section) => (
            <SidebarGroup key={section.label}>
              {!collapsed && <SidebarGroupLabel className="text-muted-foreground">{section.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item: any) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative",
                            isActive(item.url) 
                              ? "bg-primary/20 text-primary neon-glow" 
                              : "hover:bg-white/5"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                          {item.hasBadge && unreadCount > 0 && (
                            <span className={cn(
                              "absolute flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold rounded-full",
                              collapsed 
                                ? "top-0 right-0 w-4 h-4 text-[10px]" 
                                : "ml-auto w-5 h-5"
                            )}>
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            ))}

            {/* Account Menu */}
            <SidebarGroup className="mt-auto">
              {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Cuenta</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                            isActive(item.url) 
                              ? "bg-primary/20 text-primary" 
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
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 mb-4",
          collapsed && "justify-center"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
            isProducerSection 
              ? "bg-gradient-to-br from-secondary to-accent"
              : "bg-gradient-to-br from-primary to-secondary"
          )}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-heading font-bold text-primary-foreground">
                {initials}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{displayName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isProducerSection ? (
                  <span>Administrador</span>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-primary">0 XP</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

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
