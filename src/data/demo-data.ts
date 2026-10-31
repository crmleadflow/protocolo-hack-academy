// Demo data for Protocolo Hack
// This file contains all mock data for the visual demo

import { Zap, Target, Mic, Bot, Video, Crown, Package, LucideIcon } from "lucide-react";

export interface DemoLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  locked: boolean;
}

export interface DemoModule {
  id: string;
  title: string;
  description: string;
  lessons: DemoLesson[];
}

export interface DemoCourse {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent";
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  duration: string;
  featured?: boolean;
  modules?: DemoModule[];
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  hoursWatched: number;
}

export interface DemoBadge {
  id: string;
  type: "streak" | "completion" | "achievement" | "level" | "special" | "xp";
  label: string;
  value?: string | number;
  unlocked: boolean;
}

// Demo user
export const demoUser: DemoUser = {
  id: "user-1",
  name: "Carlos Mendoza",
  email: "carlos@example.com",
  level: 12,
  xp: 4750,
  streak: 15,
  hoursWatched: 42,
};

// Demo lessons for Protocolo Hack
const protocoloHackModules: DemoModule[] = [
  {
    id: "mod-1",
    title: "Fundamentos del Mindset",
    description: "Construye las bases mentales para el éxito financiero",
    lessons: [
      {
        id: "lesson-1",
        title: "Bienvenida al Protocolo",
        description: "Introducción al programa y qué esperar",
        duration: "12:34",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: true,
        locked: false,
      },
      {
        id: "lesson-2",
        title: "El Mindset del Millonario",
        description: "Reprograma tu mente para el éxito",
        duration: "18:45",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: true,
        locked: false,
      },
      {
        id: "lesson-3",
        title: "Rompiendo Creencias Limitantes",
        description: "Identifica y elimina lo que te frena",
        duration: "22:10",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: true,
        locked: false,
      },
      {
        id: "lesson-4",
        title: "Hábitos de Alto Rendimiento",
        description: "Rutinas que transforman resultados",
        duration: "15:30",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: false,
        locked: false,
      },
    ],
  },
  {
    id: "mod-2",
    title: "Estrategias de Monetización",
    description: "Aprende a generar ingresos de múltiples fuentes",
    lessons: [
      {
        id: "lesson-5",
        title: "Las 7 Fuentes de Ingreso",
        description: "Diversifica tu flujo de dinero",
        duration: "25:00",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: false,
        locked: false,
      },
      {
        id: "lesson-6",
        title: "Ingresos Pasivos 101",
        description: "Crea sistemas que trabajan por ti",
        duration: "19:45",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: false,
        locked: true,
      },
      {
        id: "lesson-7",
        title: "El Apalancamiento Digital",
        description: "Usa la tecnología a tu favor",
        duration: "21:30",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: false,
        locked: true,
      },
    ],
  },
  {
    id: "mod-3",
    title: "Acción Masiva",
    description: "Implementa todo lo aprendido",
    lessons: [
      {
        id: "lesson-8",
        title: "Plan de 90 Días",
        description: "Tu roadmap al éxito",
        duration: "28:00",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: false,
        locked: true,
      },
      {
        id: "lesson-9",
        title: "Cierre y Próximos Pasos",
        description: "Hacia dónde ir desde aquí",
        duration: "16:20",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        completed: false,
        locked: true,
      },
    ],
  },
];

// Demo courses based on Protocolo Hack programs
export const demoCourses: DemoCourse[] = [
  {
    id: "protocolo-hack",
    title: "Protocolo Hack",
    description: "Mi programa insignia para hackear tu potencial financiero con estrategias probadas.",
    icon: Zap,
    color: "primary",
    category: "mindset",
    progress: 65,
    completedLessons: 13,
    totalLessons: 20,
    duration: "8h 30min",
    featured: true,
    modules: protocoloHackModules,
  },
  {
    id: "neuro-talk",
    title: "Neuro Talk",
    description: "Domina la neuro oratoria persuasiva para cerrar ventas con el poder de tu comunicación.",
    icon: Mic,
    color: "secondary",
    category: "ventas",
    progress: 40,
    completedLessons: 6,
    totalLessons: 15,
    duration: "6h 15min",
    featured: true,
    modules: protocoloHackModules,
  },
  {
    id: "closer-project",
    title: "Closer Project",
    description: "Conviértete en un cerrador de élite capaz de manejar cualquier objeción.",
    icon: Target,
    color: "accent",
    category: "ventas",
    progress: 25,
    completedLessons: 4,
    totalLessons: 16,
    duration: "7h 45min",
    modules: protocoloHackModules,
  },
  {
    id: "ia-negocio",
    title: "IA Business Lab",
    description: "Aprende a automatizar procesos y delegar tareas operativas a la inteligencia artificial.",
    icon: Bot,
    color: "primary",
    category: "ia",
    progress: 0,
    completedLessons: 0,
    totalLessons: 12,
    duration: "5h 20min",
    modules: protocoloHackModules,
  },
  {
    id: "video-magnet",
    title: "Video Magnet",
    description: "Estrategias de contenido en video que atraen prospectos calificados en automático.",
    icon: Video,
    color: "secondary",
    category: "marketing",
    progress: 0,
    completedLessons: 0,
    totalLessons: 10,
    duration: "4h 50min",
    modules: protocoloHackModules,
  },
  {
    id: "marca-personal",
    title: "Escalar tu Marca Personal",
    description: "Pasa de ser un desconocido a ser una autoridad reconocida en tu nicho.",
    icon: Crown,
    color: "accent",
    category: "marketing",
    progress: 0,
    completedLessons: 0,
    totalLessons: 14,
    duration: "6h 30min",
    modules: protocoloHackModules,
  },
  {
    id: "producto-digital",
    title: "Producto Digital",
    description: "Mi guía paso a paso para monetizar tu conocimiento desde cero.",
    icon: Package,
    color: "primary",
    category: "marketing",
    progress: 0,
    completedLessons: 0,
    totalLessons: 18,
    duration: "8h 15min",
    modules: protocoloHackModules,
  },
];

// Demo badges
export const demoBadges: DemoBadge[] = [
  { id: "streak-7", type: "streak", label: "7 días", value: 7, unlocked: true },
  { id: "streak-30", type: "streak", label: "30 días", value: 30, unlocked: false },
  { id: "first-course", type: "completion", label: "Primer curso", unlocked: true },
  { id: "fast-learner", type: "achievement", label: "Aprendiz veloz", unlocked: true },
  { id: "level-10", type: "level", label: "Nivel 10", unlocked: true },
  { id: "xp-5000", type: "xp", label: "5K XP", unlocked: false },
];

// Stats for landing page
export const platformStats = {
  students: 380000,
  courses: 7,
  countries: 94,
  yearsExperience: 25,
};
