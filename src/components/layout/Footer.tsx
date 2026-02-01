import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Youtube, Mail } from "lucide-react";

const Footer: React.FC = () => {
  const footerLinks = {
    producto: [
      { label: "Cursos", href: "/catalog" },
      // Nota: no existe la ruta /categories en la app (redirigía a 404)
      { label: "Categorías", href: "/catalog" },
      { label: "Instructores", href: "/instructors" },
      { label: "Precios", href: "/pricing" },
    ],
    empresa: [
      { label: "Sobre Nosotros", href: "/about" },
      { label: "Carreras", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Prensa", href: "/press" },
    ],
    recursos: [
      { label: "Centro de Ayuda", href: "/help" },
      { label: "Comunidad", href: "/community" },
      { label: "Términos de Servicio", href: "/terms" },
      { label: "Privacidad", href: "/privacy" },
    ],
    contacto: [
      { label: "Contacto", href: "/contact" },
      { label: "Empresas", href: "/enterprise" },
      { label: "Partners", href: "/partners" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ];

  return (
    <footer className="relative mt-12 md:mt-20">
      {/* Gradient border top */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="glass-strong">
        <div className="container mx-auto px-3 md:px-4 py-8 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4 md:mb-6">
                <span className="font-heading font-bold text-lg md:text-xl tracking-wider text-gradient">
                  PROTOCOLO HACK
                </span>
              </Link>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 max-w-xs leading-relaxed">
                La Central de Inteligencia de Hector Galensky. Donde el conocimiento se transforma en resultados.
              </p>
              <div className="flex items-center gap-3 md:gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 md:p-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">
                Producto
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.producto.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">
                Empresa
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">
                Recursos
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.recursos.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">
                Contacto
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.contacto.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 md:mt-6">
                <a
                  href="mailto:soporte@hectorgalensky.shop"
                  className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-primary hover:underline break-all"
                >
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="break-all">soporte@hectorgalensky.shop</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <p className="text-[10px] md:text-sm text-muted-foreground text-center md:text-left">
              © 2024 Protocolo Hack. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <Link
                to="/terms"
                className="text-[10px] md:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Términos
              </Link>
              <Link
                to="/privacy"
                className="text-[10px] md:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacidad
              </Link>
              <Link
                to="/cookies"
                className="text-[10px] md:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
