import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  Mail,
  Search,
  ChevronRight,
  Loader2,
  CheckCircle,
  Sparkles,
  PlayCircle,
  Trophy,
  CreditCard,
  Shield,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const faqCategories = [
  {
    id: "getting-started",
    title: "Primeros Pasos",
    icon: PlayCircle,
    faqs: [
      {
        question: "¿Cómo empiezo con Protocolo Hack?",
        answer:
          "Una vez registrado, dirígete al catálogo de programas para explorar los cursos disponibles. Puedes inscribirte en cualquier programa y comenzar a aprender de inmediato. Todos los programas incluyen videos, recursos descargables y acceso a nuestro mentor IA.",
      },
      {
        question: "¿Qué programas están disponibles?",
        answer:
          "Ofrecemos programas especializados en producción musical, beatmaking, mezcla y masterización, y desarrollo de carrera como artista. Cada programa está diseñado para llevarte de principiante a profesional.",
      },
      {
        question: "¿Puedo ver una vista previa antes de comprar?",
        answer:
          "Sí, muchos de nuestros programas ofrecen lecciones de vista previa gratuitas. Busca las lecciones marcadas como 'Preview' para acceder a contenido de muestra.",
      },
    ],
  },
  {
    id: "mentor",
    title: "Mentor IA",
    icon: Sparkles,
    faqs: [
      {
        question: "¿Qué es el Mentor IA?",
        answer:
          "El Mentor IA es tu asistente personal de producción musical, disponible 24/7. Está entrenado con todo el contenido de nuestros programas y puede responder preguntas específicas sobre técnicas, software, y estrategias de producción.",
      },
      {
        question: "¿Cómo uso el Mentor IA?",
        answer:
          "Accede al Mentor desde el menú lateral y escribe tu pregunta. El mentor analizará tu consulta y te proporcionará respuestas detalladas basadas en el contenido de los programas.",
      },
      {
        question: "¿El Mentor puede ayudarme con problemas técnicos de mi DAW?",
        answer:
          "Sí, el Mentor puede ayudarte con preguntas sobre FL Studio, Ableton Live, Logic Pro y otros DAWs populares. Describe tu problema con detalle para obtener la mejor respuesta.",
      },
    ],
  },
  {
    id: "courses",
    title: "Cursos y Contenido",
    icon: BookOpen,
    faqs: [
      {
        question: "¿Cómo descargo los recursos de las lecciones?",
        answer:
          "En cada lección encontrarás una sección de 'Recursos' donde puedes descargar archivos de proyecto, samples, presets y materiales adicionales incluidos en tu suscripción.",
      },
      {
        question: "¿Puedo ver las lecciones en cualquier dispositivo?",
        answer:
          "Sí, nuestra plataforma es completamente responsive. Puedes acceder desde computadora, tablet o smartphone sin perder funcionalidad.",
      },
      {
        question: "¿Se guarda mi progreso automáticamente?",
        answer:
          "Sí, tu progreso se guarda automáticamente. Puedes pausar un video y retomarlo exactamente donde lo dejaste en cualquier momento.",
      },
    ],
  },
  {
    id: "achievements",
    title: "Logros y Gamificación",
    icon: Trophy,
    faqs: [
      {
        question: "¿Cómo funcionan los puntos XP?",
        answer:
          "Ganas puntos XP al completar lecciones, módulos y programas completos. También puedes ganar XP por mantener rachas de estudio consecutivas y participar en la comunidad.",
      },
      {
        question: "¿Qué beneficios obtengo al subir de nivel?",
        answer:
          "Al subir de nivel desbloqueas insignias exclusivas que aparecen en tu perfil y demuestran tu progreso. Algunos niveles también desbloquean logros ocultos especiales.",
      },
      {
        question: "¿Cómo mantengo mi racha activa?",
        answer:
          "Completa al menos una lección cada día para mantener tu racha. Tu racha se reinicia si pasa un día sin actividad de aprendizaje.",
      },
    ],
  },
  {
    id: "payments",
    title: "Pagos y Suscripciones",
    icon: CreditCard,
    faqs: [
      {
        question: "¿Qué métodos de pago aceptan?",
        answer:
          "Aceptamos pagos a través de PayPal, que incluye tarjetas de crédito, débito y saldo de PayPal. Todos los pagos son procesados de forma segura.",
      },
      {
        question: "¿Puedo pagar en cuotas?",
        answer:
          "Dependiendo de tu ubicación, PayPal puede ofrecer opciones de pago en cuotas. Esto se mostrará durante el proceso de checkout si está disponible.",
      },
      {
        question: "¿Ofrecen reembolsos?",
        answer:
          "Ofrecemos una garantía de satisfacción de 7 días. Si no estás satisfecho con el programa, contáctanos para solicitar un reembolso completo.",
      },
    ],
  },
  {
    id: "account",
    title: "Cuenta y Perfil",
    icon: User,
    faqs: [
      {
        question: "¿Cómo cambio mi contraseña?",
        answer:
          "Ve a Configuración desde el menú lateral y encontrarás la opción para cambiar tu contraseña. También puedes usar la opción 'Olvidé mi contraseña' desde la página de inicio de sesión.",
      },
      {
        question: "¿Cómo actualizo mi foto de perfil?",
        answer:
          "En la sección de Perfil puedes hacer clic en tu avatar actual para subir una nueva imagen. Puedes recortarla y ajustarla antes de guardar.",
      },
      {
        question: "¿Puedo cambiar mi nombre de usuario?",
        answer:
          "Sí, puedes actualizar tu nombre completo en cualquier momento desde la sección de Perfil. Este nombre aparecerá en tu perfil público y en la comunidad.",
      },
    ],
  },
];

const HelpPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  const displayCategories = selectedCategory
    ? filteredCategories.filter((c) => c.id === selectedCategory)
    : filteredCategories;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el asunto y el mensaje.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Get admin users to send message to
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .limit(1);

      if (admins && admins.length > 0 && user) {
        await supabase.from("direct_messages").insert({
          sender_id: user.id,
          recipient_id: admins[0].user_id,
          subject: `[Ayuda] ${contactSubject}`,
          content: contactMessage,
        });
      }

      setMessageSent(true);
      setContactSubject("");
      setContactMessage("");
      toast({
        title: "Mensaje enviado",
        description: "Hemos recibido tu mensaje. Te responderemos pronto.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-gradient mb-2">
                Centro de Ayuda
              </h1>
              <p className="text-muted-foreground">
                Encuentra respuestas a tus preguntas o contáctanos directamente
              </p>
            </div>

            {/* Search */}
            <div className="mb-8">
              <GlassInput
                placeholder="Buscar en preguntas frecuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="max-w-xl"
              />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {faqCategories.map((category) => (
                <HolographicCard
                  key={category.id}
                  className={`p-4 text-center cursor-pointer transition-all hover:scale-105 ${
                    selectedCategory === category.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                >
                  <category.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <span className="text-sm font-medium">{category.title}</span>
                </HolographicCard>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* FAQ Section */}
              <div className="lg:col-span-2">
                <HolographicCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <HelpCircle className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">
                      Preguntas Frecuentes
                    </h2>
                  </div>

                  {displayCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron resultados para "{searchTerm}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayCategories.map((category) => (
                        <div key={category.id}>
                          <div className="flex items-center gap-2 mb-3">
                            <category.icon className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">{category.title}</h3>
                          </div>
                          <Accordion type="single" collapsible className="w-full">
                            {category.faqs.map((faq, index) => (
                              <AccordionItem
                                key={index}
                                value={`${category.id}-${index}`}
                              >
                                <AccordionTrigger className="text-left hover:text-primary">
                                  {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))}
                    </div>
                  )}
                </HolographicCard>
              </div>

              {/* Contact Section */}
              <div className="space-y-6">
                {/* Mentor AI Quick Link */}
                <HolographicCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold">Pregúntale al Mentor IA</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    ¿Tienes alguna pregunta? Nuestro asistente de IA está
                    disponible 24/7.
                  </p>
                  <NeonButton
                    className="w-full"
                    onClick={() => (window.location.href = "/mentor")}
                  >
                    <Sparkles className="w-4 h-4" />
                    Ir al Mentor
                    <ChevronRight className="w-4 h-4" />
                  </NeonButton>
                </HolographicCard>

                {/* Contact Form */}
                <HolographicCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold">Contáctanos</h3>
                  </div>

                  {messageSent ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h4 className="font-semibold mb-2">¡Mensaje enviado!</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Te responderemos a la brevedad posible.
                      </p>
                      <NeonButton
                        variant="ghost"
                        onClick={() => setMessageSent(false)}
                      >
                        Enviar otro mensaje
                      </NeonButton>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Asunto
                        </label>
                        <GlassInput
                          placeholder="¿En qué podemos ayudarte?"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Mensaje
                        </label>
                        <Textarea
                          placeholder="Describe tu pregunta o problema con detalle..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          rows={5}
                          className="bg-white/5 border-white/10 focus:border-primary/50"
                        />
                      </div>
                      <NeonButton
                        type="submit"
                        className="w-full"
                        disabled={isSending}
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            Enviar Mensaje
                          </>
                        )}
                      </NeonButton>
                    </form>
                  )}
                </HolographicCard>

                {/* Security Note */}
                <HolographicCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold">Seguridad</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nunca te pediremos tu contraseña por mensaje. Si recibes una
                    solicitud sospechosa, repórtala inmediatamente.
                  </p>
                </HolographicCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HelpPage;
