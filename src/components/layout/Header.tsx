import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, User, LogOut, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassInput } from "@/components/ui/glass-input";
import { NeonButton } from "@/components/ui/neon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: {
    name: string;
    avatar: string;
    role: "student" | "producer";
  };
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, transparent = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Explorar", href: "/catalog" },
    { label: "Categorías", href: "/categories" },
    { label: "Para Empresas", href: "/enterprise" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "glass-strong border-b border-white/10"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="font-heading font-bold text-xl tracking-wider text-gradient">
              PROTOCOLO HACK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search, Notifications, User */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:block">
              {isSearchOpen ? (
                <div className="flex items-center gap-2">
                  <GlassInput
                    placeholder="Buscar cursos..."
                    className="w-64"
                    icon={<Search className="w-4 h-4" />}
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full pulse-glow" />
                </button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/50 transition-all">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full border-2 border-primary"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-strong">
                    <div className="px-3 py-2">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role === "student" ? "Estudiante" : "Productor"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(user.role === "student" ? "/student" : "/producer")}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Mi Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/login")} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <NeonButton variant="ghost" size="sm">
                    Iniciar Sesión
                  </NeonButton>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <NeonButton size="sm">
                    Comenzar Gratis
                  </NeonButton>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden glass-strong border-t border-white/10 animate-fade-in">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
              <GlassInput
                placeholder="Buscar cursos..."
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };
