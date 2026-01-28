// Demo data for Protocolo Hack
// This file contains all mock data for the visual demo

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: Instructor;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  category: string;
  modules: Module[];
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  progress?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "quiz" | "exercise" | "resource";
  videoUrl?: string;
  completed?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  expertise: string[];
  courseCount: number;
  studentCount: number;
  rating: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "student" | "producer";
  level: "Novice" | "Learner" | "Expert" | "Master";
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: string[];
  enrolledCourses: string[];
  completedCourses: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  company?: string;
}

// Instructors
export const instructors: Instructor[] = [
  {
    id: "inst-1",
    name: "Carlos Mendoza",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Ingeniero de software con 15+ años de experiencia en empresas Fortune 500. Especialista en arquitectura de sistemas y desarrollo full-stack.",
    expertise: ["React", "Node.js", "Cloud Architecture", "System Design"],
    courseCount: 8,
    studentCount: 45000,
    rating: 4.9,
  },
  {
    id: "inst-2",
    name: "María García",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    bio: "Data Scientist y Machine Learning Engineer. Ex-Google, especializada en IA aplicada y análisis de datos.",
    expertise: ["Python", "Machine Learning", "Data Science", "AI"],
    courseCount: 5,
    studentCount: 32000,
    rating: 4.8,
  },
  {
    id: "inst-3",
    name: "Andrés Ramírez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Diseñador UX/UI con experiencia en startups exitosas. Fundador de estudio de diseño digital.",
    expertise: ["UI Design", "UX Research", "Figma", "Design Systems"],
    courseCount: 6,
    studentCount: 28000,
    rating: 4.9,
  },
];

// Courses
export const courses: Course[] = [
  {
    id: "course-1",
    title: "React Avanzado: Patrones y Arquitectura",
    description: "Domina los patrones de diseño más avanzados de React. Aprende a construir aplicaciones escalables y mantenibles con las mejores prácticas de la industria.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    instructor: instructors[0],
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviewCount: 2847,
    studentCount: 15420,
    duration: "42 horas",
    level: "Avanzado",
    category: "Desarrollo Web",
    isFeatured: true,
    tags: ["React", "JavaScript", "Frontend"],
    modules: [
      {
        id: "mod-1-1",
        title: "Fundamentos Avanzados",
        description: "Repaso profundo de hooks, context y renderizado",
        duration: "6h 30min",
        lessons: [
          { id: "les-1-1-1", title: "Hooks personalizados avanzados", duration: "45min", type: "video", videoUrl: "https://www.youtube.com/embed/dpw9EHDh2bM" },
          { id: "les-1-1-2", title: "Optimización de re-renders", duration: "52min", type: "video" },
          { id: "les-1-1-3", title: "Context API en profundidad", duration: "38min", type: "video" },
          { id: "les-1-1-4", title: "Quiz: Fundamentos", duration: "15min", type: "quiz" },
        ],
      },
      {
        id: "mod-1-2",
        title: "Patrones de Composición",
        description: "Compound components, render props y más",
        duration: "8h 15min",
        lessons: [
          { id: "les-1-2-1", title: "Compound Components Pattern", duration: "55min", type: "video" },
          { id: "les-1-2-2", title: "Render Props Pattern", duration: "48min", type: "video" },
          { id: "les-1-2-3", title: "HOC vs Hooks", duration: "42min", type: "video" },
          { id: "les-1-2-4", title: "Ejercicio práctico", duration: "90min", type: "exercise" },
        ],
      },
      {
        id: "mod-1-3",
        title: "State Management Avanzado",
        description: "Redux Toolkit, Zustand, Jotai y más",
        duration: "10h",
        lessons: [
          { id: "les-1-3-1", title: "Redux Toolkit moderno", duration: "65min", type: "video" },
          { id: "les-1-3-2", title: "Zustand: Simplicidad y poder", duration: "55min", type: "video" },
          { id: "les-1-3-3", title: "React Query para server state", duration: "70min", type: "video" },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "Machine Learning desde Cero",
    description: "Aprende los fundamentos de Machine Learning y construye tus primeros modelos de IA. Desde regresión lineal hasta redes neuronales.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    instructor: instructors[1],
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviewCount: 1923,
    studentCount: 12350,
    duration: "56 horas",
    level: "Intermedio",
    category: "Data Science",
    isFeatured: true,
    isNew: true,
    tags: ["Python", "ML", "AI", "Data Science"],
    modules: [
      {
        id: "mod-2-1",
        title: "Introducción a ML",
        description: "Conceptos fundamentales y matemáticas",
        duration: "8h",
        lessons: [
          { id: "les-2-1-1", title: "¿Qué es Machine Learning?", duration: "35min", type: "video" },
          { id: "les-2-1-2", title: "Matemáticas esenciales", duration: "60min", type: "video" },
          { id: "les-2-1-3", title: "Python para ML", duration: "45min", type: "video" },
        ],
      },
      {
        id: "mod-2-2",
        title: "Algoritmos Supervisados",
        description: "Regresión y clasificación",
        duration: "12h",
        lessons: [
          { id: "les-2-2-1", title: "Regresión Lineal", duration: "55min", type: "video" },
          { id: "les-2-2-2", title: "Árboles de Decisión", duration: "50min", type: "video" },
          { id: "les-2-2-3", title: "Random Forest", duration: "48min", type: "video" },
        ],
      },
    ],
  },
  {
    id: "course-3",
    title: "Diseño UI/UX Profesional",
    description: "Aprende a diseñar interfaces increíbles y experiencias de usuario memorables. Desde la investigación hasta el prototipado.",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    instructor: instructors[2],
    price: 79.99,
    rating: 4.9,
    reviewCount: 3156,
    studentCount: 18900,
    duration: "38 horas",
    level: "Principiante",
    category: "Diseño",
    tags: ["UI", "UX", "Figma", "Design"],
    modules: [
      {
        id: "mod-3-1",
        title: "Fundamentos de UX",
        description: "Research, personas y journey maps",
        duration: "10h",
        lessons: [
          { id: "les-3-1-1", title: "Introducción a UX", duration: "40min", type: "video" },
          { id: "les-3-1-2", title: "User Research", duration: "55min", type: "video" },
          { id: "les-3-1-3", title: "Creando Personas", duration: "45min", type: "video" },
        ],
      },
    ],
  },
  {
    id: "course-4",
    title: "Node.js Backend Masterclass",
    description: "Construye APIs robustas y escalables con Node.js. Aprende Express, MongoDB, autenticación y deployment.",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
    instructor: instructors[0],
    price: 99.99,
    originalPrice: 159.99,
    rating: 4.7,
    reviewCount: 2134,
    studentCount: 11200,
    duration: "48 horas",
    level: "Intermedio",
    category: "Backend",
    isNew: true,
    tags: ["Node.js", "Express", "MongoDB", "API"],
    modules: [
      {
        id: "mod-4-1",
        title: "Fundamentos de Node.js",
        description: "Event loop, módulos y async",
        duration: "8h",
        lessons: [
          { id: "les-4-1-1", title: "Event Loop explicado", duration: "50min", type: "video" },
          { id: "les-4-1-2", title: "Módulos y NPM", duration: "40min", type: "video" },
        ],
      },
    ],
  },
  {
    id: "course-5",
    title: "TypeScript Completo",
    description: "Domina TypeScript desde cero hasta nivel experto. Tipos avanzados, generics, decorators y más.",
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
    instructor: instructors[0],
    price: 69.99,
    rating: 4.8,
    reviewCount: 1876,
    studentCount: 9800,
    duration: "32 horas",
    level: "Intermedio",
    category: "Desarrollo Web",
    tags: ["TypeScript", "JavaScript", "Frontend"],
    modules: [],
  },
  {
    id: "course-6",
    title: "Deep Learning con PyTorch",
    description: "Aprende a construir redes neuronales profundas con PyTorch. CNNs, RNNs, Transformers y más.",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
    instructor: instructors[1],
    price: 149.99,
    rating: 4.9,
    reviewCount: 987,
    studentCount: 5600,
    duration: "64 horas",
    level: "Avanzado",
    category: "Data Science",
    isFeatured: true,
    tags: ["PyTorch", "Deep Learning", "Neural Networks"],
    modules: [],
  },
];

// Demo users
export const demoStudent: User = {
  id: "user-1",
  name: "Sarah Smith",
  email: "sarah@example.com",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  role: "student",
  level: "Learner",
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 15,
  badges: ["streak-7", "first-course", "fast-learner"],
  enrolledCourses: ["course-1", "course-2", "course-3"],
  completedCourses: ["course-5"],
};

export const demoProducer: User = {
  id: "user-2",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role: "producer",
  level: "Master",
  xp: 15000,
  xpToNextLevel: 20000,
  streak: 45,
  badges: ["top-producer", "1k-students", "5-star"],
  enrolledCourses: [],
  completedCourses: [],
};

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "Ana Martínez",
    role: "Senior Developer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    quote: "Protocolo Hack transformó mi carrera. Los cursos son increíblemente prácticos y los instructores son de primer nivel.",
    company: "Google",
  },
  {
    id: "test-2",
    name: "Roberto Sánchez",
    role: "Data Scientist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "La calidad del contenido es excepcional. Pasé de no saber nada de ML a conseguir trabajo en una startup de IA.",
    company: "OpenAI",
  },
  {
    id: "test-3",
    name: "Laura Torres",
    role: "UX Designer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    quote: "El enfoque práctico y los proyectos reales me ayudaron a construir un portfolio impresionante.",
    company: "Meta",
  },
  {
    id: "test-4",
    name: "Diego Fernández",
    role: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    quote: "La comunidad de Protocolo Hack es increíble. Siempre hay alguien dispuesto a ayudar.",
    company: "Netflix",
  },
];

// Reviews
export const reviews: Review[] = [
  {
    id: "rev-1",
    userId: "user-3",
    userName: "Pedro López",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    comment: "Excelente curso, muy bien estructurado y con ejemplos prácticos que realmente ayudan a entender los conceptos.",
    date: "2024-01-15",
    helpful: 45,
  },
  {
    id: "rev-2",
    userId: "user-4",
    userName: "Carmen Ruiz",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    comment: "El mejor curso de React que he tomado. Carlos explica todo de manera muy clara.",
    date: "2024-01-10",
    helpful: 38,
  },
  {
    id: "rev-3",
    userId: "user-5",
    userName: "Miguel Ángel",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=face",
    rating: 4,
    comment: "Muy buen contenido, aunque algunos videos podrían ser más cortos. En general, muy recomendado.",
    date: "2024-01-05",
    helpful: 22,
  },
];

// Stats for landing page
export const platformStats = {
  students: 125000,
  courses: 250,
  instructors: 85,
  completionRate: 94,
};

// Categories
export const categories = [
  { id: "dev-web", name: "Desarrollo Web", icon: "Code", count: 45 },
  { id: "data-science", name: "Data Science", icon: "BarChart", count: 32 },
  { id: "design", name: "Diseño", icon: "Palette", count: 28 },
  { id: "backend", name: "Backend", icon: "Server", count: 24 },
  { id: "mobile", name: "Mobile", icon: "Smartphone", count: 18 },
  { id: "devops", name: "DevOps", icon: "Cloud", count: 15 },
];
