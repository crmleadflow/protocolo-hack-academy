import { GraduationCap, Puzzle, Users, Workflow, Mic, Gift, MessagesSquare, CalendarDays, Wrench } from "lucide-react";

export const ECOSYSTEM = [
  { to: "/academia", icon: GraduationCap, title: "Academia", text: "Cursos de IA, neuroventas y estrategia digital." },
  { to: "/marketplace", icon: Puzzle, title: "Marketplace", text: "Plugins, herramientas y productos digitales." },
  { to: "/mentorias", icon: Users, title: "Mentorías", text: "Sesiones individuales y grupales." },
  { to: "/lead-flow", icon: Workflow, title: "Lead Flow", text: "El CRM para captar y cerrar más ventas." },
  { to: "/conferencias", icon: Mic, title: "Conferencias", text: "Formación para equipos y empresas." },
  { to: "/recursos", icon: Gift, title: "Recursos", text: "Guías, plantillas y clases sin costo." },
  { to: "/herramientas", icon: Wrench, title: "Herramientas", text: "Neuro Analyzer Pro y Mi Mentor IA." },
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

export const SEMINARS = [
  { name: "Neuroventas: el lenguaje del cliente", text: "Qué pasa en la mente del cliente antes de comprar y cómo hablarle para que decida.", mode: "Sesión en vivo · online" },
  { name: "IA aplicada a las ventas", text: "Qué tareas de tu proceso comercial puedes automatizar desde hoy, con ejemplos reales.", mode: "Sesión en vivo · online" },
  { name: "Automatiza tu operación", text: "Delega el trabajo repetitivo a la inteligencia artificial y recupera tiempo para vender.", mode: "Sesión en vivo · online" },
];

export const CAPACITATIONS = [
  { name: "Equipo comercial", format: "A medida · presencial u online", text: "Neuroventas y uso práctico de la IA en el día a día de tu fuerza de ventas." },
  { name: "Líderes y gerencia", format: "Jornada intensiva", text: "Priorizar, decidir y delegar con apoyo de inteligencia artificial." },
  { name: "Estándar de conversación", format: "4 sesiones", text: "Guiones y criterios comunes para que todo el equipo venda con el mismo nivel." },
];

export const BOOTCAMP_WEEKS = [
  { week: "Semana 1", name: "Diagnóstico", text: "Medimos dónde está tu negocio hoy y definimos una meta concreta de ventas." },
  { week: "Semana 2", name: "Comunicación que cierra", text: "Guiones y gatillos mentales: cómo hablar al cerebro emocional del cliente." },
  { week: "Semana 3", name: "Operación con IA", text: "Automatizas las tareas repetitivas y delegas el trabajo operativo en inteligencia artificial." },
  { week: "Semana 4", name: "Ejecución y resultados", text: "Montas tu embudo con acompañamiento y revisamos los primeros números." },
];
