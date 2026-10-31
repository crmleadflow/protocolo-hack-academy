import { GraduationCap, Puzzle, Users, Workflow, Mic, Gift, MessagesSquare, CalendarDays } from "lucide-react";

export const ECOSYSTEM = [
  { to: "/academia", icon: GraduationCap, title: "Academia", text: "Cursos de IA, neuroventas y estrategia digital." },
  { to: "/marketplace", icon: Puzzle, title: "Marketplace", text: "Plugins, herramientas y productos digitales." },
  { to: "/mentorias", icon: Users, title: "Mentorías", text: "Sesiones individuales y grupales." },
  { to: "/lead-flow", icon: Workflow, title: "Lead Flow", text: "El CRM para captar y cerrar más ventas." },
  { to: "/conferencias", icon: Mic, title: "Conferencias", text: "Formación para equipos y empresas." },
  { to: "/recursos", icon: Gift, title: "Recursos gratis", text: "Guías, plantillas y clases sin costo." },
  { to: "/comunidad", icon: MessagesSquare, title: "Comunidad", text: "Conversa con otros emprendedores." },
  { to: "/eventos", icon: CalendarDays, title: "Eventos", text: "Webinars y clases en vivo." },
];

export const TOOLS = [
  { name: "Mi Mentor IA", tag: "Asistente", text: "Tu mentor con inteligencia artificial disponible 24/7.", price: "USD 150" },
  { name: "Neuro Analyzer Pro", tag: "Análisis", text: "Analiza tus llamadas de venta con IA y mejora tu cierre.", price: "USD 150" },
  { name: "Arsenal Maestro Hack 6", tag: "Paquete", text: "Los 6 programas + herramientas de IA incluidas.", price: "USD 499" },
];

export const MENTORSHIPS = [
  { name: "Sesión estratégica 1:1", format: "Individual · 60 min", text: "Diagnóstico de tu negocio y plan de acción concreto." },
  { name: "Mentoría de implementación", format: "Individual · 4 semanas", text: "Acompañamiento semanal para ejecutar tu estrategia." },
  { name: "Mastermind grupal", format: "Grupal · mensual", text: "Sesiones en vivo con un grupo reducido de emprendedores." },
];

export const LEADFLOW_PLANS = [
  { name: "Starter", text: "Para emprendedores que empiezan a ordenar sus ventas.", features: ["Pipeline de ventas", "Captura de leads", "1 usuario"] },
  { name: "Growth", text: "Para negocios con equipo comercial.", features: ["Automatizaciones", "WhatsApp y email", "Hasta 5 usuarios"], featured: true },
  { name: "Empresa", text: "Para operaciones comerciales grandes.", features: ["Usuarios ilimitados", "Integraciones a medida", "Soporte dedicado"] },
];

export const CONFERENCES = [
  { name: "IA aplicada a las ventas", text: "Cómo usar inteligencia artificial para vender más y mejor." },
  { name: "Neuroventas", text: "Lo que pasa en la mente del cliente antes de comprar." },
  { name: "Transformación digital", text: "Procesos, automatización y cultura para equipos modernos." },
];

export const RESOURCES = [
  { name: "Guía: 10 prompts para vender con IA", type: "Guía PDF" },
  { name: "Plantilla de guion de ventas", type: "Plantilla" },
  { name: "Clase: Tu primer embudo digital", type: "Video" },
  { name: "Checklist de automatización", type: "Checklist" },
];

export const EVENTS = [
  { name: "Webinar: IA para emprendedores", date: "Próximamente", mode: "En vivo · online" },
  { name: "Clase abierta de neuroventas", date: "Próximamente", mode: "En vivo · online" },
  { name: "Q&A con Héctor Galensky", date: "Próximamente", mode: "Comunidad" },
];

export const FAQS = [
  { q: "¿Qué es Protocolo Hack?", a: "Un ecosistema para aprender, implementar y escalar tu negocio: academia, herramientas, mentorías, comunidad y eventos." },
  { q: "¿Necesito experiencia previa?", a: "No. Los contenidos van de lo básico a lo avanzado, con pasos concretos para aplicar." },
  { q: "¿Cómo accedo a mis cursos?", a: "Entra con tu correo y verás todos tus cursos y compras en Mi cuenta." },
  { q: "¿Puedo contratar una conferencia para mi empresa?", a: "Sí. Completa el formulario en Conferencias y te enviamos una propuesta." },
  { q: "¿Qué métodos de pago aceptan?", a: "Pagos internacionales con tarjeta y criptomonedas. Pronto pagos locales en Colombia." },
];
