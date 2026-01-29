import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BookOpen, Trophy, Settings, LogOut, User,
  Zap, MessageSquare, HelpCircle, Shield, Sparkles, Brain, PanelLeft
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

import { Mail } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Programas", url: "/catalog", icon: BookOpen },
  { title: "Mi Mentor", url: "/mentor", icon: Sparkles },
  { title: "Neuro Scanner", url: "/neuro-scanner", icon: Brain },
  { title: "Mensajes", url: "/messages", icon: Mail, hasBadge: true },
  { title: "Logros", url: "/achievements", icon: Trophy },
  { title: "Comunidad", url: "/community", icon: MessageSquare },
];

const secondaryItems = [
  { title: "Mi Perfil", url: "/profile", icon: User },
  { title: "Configuración", url: "/settings", icon: Settings },
  { title: "Ayuda", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state, setOpenMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, signOut } = useAuth();
  const { profile, displayName, initials } = useProfile();
  const { unreadCount } = useDirectMessages();

  const isActive = (path: string) => location.pathname === path;

  // Cerrar el sidebar en móvil al hacer clic en un enlace
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
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Menu */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Menú Principal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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

        {/* Admin Link */}
        {isAdmin && (
          <SidebarGroup className="mt-4">
            {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Administración</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/producer" 
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                        isActive("/producer") 
                          ? "bg-secondary/20 text-secondary neon-glow-purple" 
                          : "hover:bg-white/5"
                      )}
                    >
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>Panel Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Secondary Menu */}
        <SidebarGroup className="mt-auto">
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground">Cuenta</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 mb-4",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
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
              <div className="flex items-center gap-1 text-xs text-primary">
                <Zap className="w-3 h-3" />
                <span>0 XP</span>
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
