import React from "react";
import { Link } from "react-router-dom";
import { Youtube, Instagram, Mail, MessageCircle } from "lucide-react";

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: MessageCircle, href: "https://wa.me/", label: "WhatsApp" },
  ];

  return (
    <footer className="relative mt-8 md:mt-12">
      {/* Gradient border top */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="glass-strong">
        <div className="container mx-auto px-4 py-6 md:py-10">
          {/* Main content */}
          <div className="flex flex-col items-center text-center gap-4 md:gap-6">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3">
              <span className="font-heading font-bold text-lg md:text-xl tracking-wider text-gradient">
                PROTOCOLO HACK
              </span>
            </Link>
            
            <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed">
              La Central de Inteligencia de Hector Galensky. Donde el conocimiento se transforma en resultados.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Email */}
            <a
              href="mailto:soporte@hectorgalensky.shop"
              className="inline-flex items-center gap-2 text-xs md:text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              soporte@hectorgalensky.shop
            </a>
          </div>

          {/* Bottom */}
          <div className="mt-6 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p className="text-[10px] md:text-xs text-muted-foreground">
              © 2024 Protocolo Hack. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/terms"
                className="text-[10px] md:text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Términos
              </Link>
              <Link
                to="/privacy"
                className="text-[10px] md:text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
