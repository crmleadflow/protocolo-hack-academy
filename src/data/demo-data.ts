// Demo data for Protocolo Hack
// This file contains all mock data for the visual demo

import { Zap, Target, Mic, Bot, Video, Crown, Package, LucideIcon } from "lucide-react";

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
  },
  {
    id: "ia-negocio",
    title: "IA para tu Negocio",
    description: "Aprende a automatizar procesos y delegar tareas operativas a la inteligencia artificial.",
    icon: Bot,
    color: "primary",
    category: "ia",
    progress: 0,
    completedLessons: 0,
    totalLessons: 12,
    duration: "5h 20min",
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
