import React, { useState, useRef, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FloatingSidebarTrigger } from "@/components/ui/floating-sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, Mic, MicOff, Play, Square, Upload, Trash2, 
  TrendingUp, AlertTriangle, Sparkles, Clock, Zap,
  ChevronRight, ChevronDown, BarChart3, Target, Volume2, Home, BookOpen, 
  MessageSquare, Trophy, Settings, ArrowLeft, Menu
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNeuroScanner, NeuroScan } from "@/hooks/useNeuroScanner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function NeuroScannerPage() {
  const navigate = useNavigate();
  const { scans, isLoadingScans, isAnalyzing, averageScore, bestScore, analyze, deleteScan } = useNeuroScanner();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedScan, setSelectedScan] = useState<NeuroScan | null>(null);
  const [activeTab, setActiveTab] = useState("record");
  const [micError, setMicError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Auto-hide menu when changing tabs or when recording/analyzing
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsNavOpen(false);
  };
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  // Initialize speech recognition once on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn("Web Speech API not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      
      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: Event & { error?: string }) => {
      console.error("Speech recognition error:", event);
      const errorType = event.error || "unknown";
      
      let errorMessage = "Error de reconocimiento de voz";
      
      switch (errorType) {
        case "not-allowed":
          errorMessage = "Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en tu navegador.";
          break;
        case "no-speech":
          errorMessage = "No se detectó voz. Intenta hablar más cerca del micrófono.";
          break;
        case "audio-capture":
          errorMessage = "No se encontró micrófono. Verifica que esté conectado.";
          break;
        case "network":
          errorMessage = "Error de red. Verifica tu conexión a internet.";
          break;
        case "aborted":
          // User aborted, not an error
          return;
        default:
          errorMessage = `Error: ${errorType}`;
      }
      
      setMicError(errorMessage);
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognition.onend = () => {
      // Restart if still recording
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        recognition.stop();
      } catch (e) {
        // Ignore
      }
    };
  }, []);

  const startRecording = async () => {
    if (!isSupported || !recognitionRef.current) {
      setMicError("Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.");
      return;
    }

    // Request microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
    } catch (err) {
      console.error("Microphone permission error:", err);
      setMicError("No se pudo acceder al micrófono. Por favor, permite el acceso en tu navegador.");
      return;
    }
    
    setMicError(null);
    setTranscript("");
    setInterimTranscript("");
    setRecordingTime(0);
    setIsRecording(true);
    isRecordingRef.current = true;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setMicError("Error al iniciar la grabación. Intenta de nuevo.");
      setIsRecording(false);
      isRecordingRef.current = false;
      return;
    }
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setInterimTranscript("");
    
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error("Failed to stop recognition:", e);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAnalyze = async () => {
    if (transcript.trim().length < 20) {
      alert("El transcript debe tener al menos 20 caracteres");
      return;
    }

    try {
      const result = await analyze({
        transcript: transcript.trim(),
        durationSeconds: recordingTime || 60,
        title: title || undefined,
      });

      if (result?.scan) {
        setSelectedScan(result.scan);
        setActiveTab("results");
        setTranscript("");
        setTitle("");
        setRecordingTime(0);
      }
    } catch {
      // useNeuroScanner already shows a toast; avoid unhandled promise rejection
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Maestro del Cierre";
    if (score >= 80) return "Experto";
    if (score >= 70) return "Avanzado";
    if (score >= 60) return "Intermedio";
    if (score >= 40) return "En Desarrollo";
    return "Principiante";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <FloatingSidebarTrigger />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Collapsible Navigation Header */}
            <Collapsible open={isNavOpen} onOpenChange={setIsNavOpen}>
              <div className="glass-card rounded-xl p-4">
                {/* Header with Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      title="Volver"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <CollapsibleTrigger asChild>
                      <button 
                        className={cn(
                          "p-2 rounded-lg border border-border/50 transition-all",
                          isNavOpen 
                            ? "bg-primary/20 border-primary/50 text-primary" 
                            : "hover:bg-muted/50"
                        )}
                        title={isNavOpen ? "Cerrar menú" : "Abrir menú"}
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                    </CollapsibleTrigger>
                    
                    <div className="flex items-center gap-3">
                      <Brain className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gradient">
                          Neuro Scanner
                        </h1>
                        <p className="text-sm text-muted-foreground hidden md:block">
                          Analiza tu discurso de venta
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="flex gap-4">
                    <Card className="glass-card border-primary/20 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Promedio</p>
                          <p className={cn("font-bold", getScoreColor(averageScore))}>{averageScore}%</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="glass-card border-secondary/20 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Mejor</p>
                          <p className={cn("font-bold", getScoreColor(bestScore))}>{bestScore}%</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Collapsible Navigation Content */}
                <CollapsibleContent className="mt-4">
                  <div className="border-t border-border/50 pt-4 space-y-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                      <Link 
                        to="/dashboard" 
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span>Inicio</span>
                      </Link>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <Brain className="w-4 h-4 text-primary" />
                        Neuro Scanner
                      </span>
                    </div>

                    {/* Quick Navigation Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Home className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                      <Link
                        to="/catalog"
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Cursos</span>
                      </Link>
                      <Link
                        to="/mentor"
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Mentor IA</span>
                      </Link>
                      <Link
                        to="/achievements"
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Logros</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Ajustes</span>
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm">
                      Analiza tu discurso de venta y mejora tu capacidad de cierre con inteligencia artificial.
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="glass-card">
                <TabsTrigger value="record" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Grabar / Analizar
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Resultados
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Historial ({scans.length})
                </TabsTrigger>
              </TabsList>

              {/* Record Tab */}
              <TabsContent value="record" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recording Section */}
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-primary" />
                        Grabación de Voz
                      </CardTitle>
                      <CardDescription>
                        Practica tu discurso de venta y el sistema transcribirá automáticamente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Input
                        placeholder="Título del análisis (opcional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="glass-input"
                      />

                      {/* Recording Controls */}
                      <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-8">
                          {/* Record Button */}
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              disabled={isAnalyzing}
                              className={cn(
                                "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300",
                                isRecording 
                                  ? "bg-destructive/20 border-2 border-destructive animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                                  : "bg-primary/20 border-2 border-primary hover:bg-primary/30 shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)]"
                              )}
                            >
                              {isRecording ? (
                                <Square className="w-10 h-10 text-destructive" />
                              ) : (
                                <Mic className="w-10 h-10 text-primary" />
                              )}
                            </button>
                            <p className="text-xs text-muted-foreground">
                              {isRecording ? "Detener" : "Grabar"}
                            </p>
                          </div>

                          {/* Analyze Button */}
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={handleAnalyze}
                              disabled={isAnalyzing || isRecording || transcript.trim().length < 20}
                              className={cn(
                                "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300",
                                isAnalyzing
                                  ? "bg-secondary/30 border-2 border-secondary animate-pulse"
                                  : transcript.trim().length >= 20 && !isRecording
                                    ? "bg-secondary/20 border-2 border-secondary hover:bg-secondary/30 shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]"
                                    : "bg-muted/20 border-2 border-muted-foreground/30 opacity-50 cursor-not-allowed"
                              )}
                            >
                              {isAnalyzing ? (
                                <Brain className="w-10 h-10 text-secondary animate-pulse" />
                              ) : (
                                <Zap className="w-10 h-10 text-secondary" />
                              )}
                            </button>
                            <p className="text-xs text-muted-foreground">
                              {isAnalyzing ? "Analizando..." : "Analizar"}
                            </p>
                          </div>
                        </div>
                        
                        {isRecording && (
                          <div className="flex items-center gap-2 text-destructive">
                            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                          </div>
                        )}

                        {/* Error Message */}
                        {micError && (
                          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center max-w-[320px]">
                            <p className="text-sm text-destructive">{micError}</p>
                          </div>
                        )}

                        {/* Status Message */}
                        <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                          {!isSupported 
                            ? "Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge."
                            : isRecording 
                              ? "Hablando... El texto aparece a la derecha" 
                              : transcript.trim().length >= 20
                                ? "¡Listo! Presiona Analizar para ver tu puntaje"
                                : "Graba tu discurso o pega texto a la derecha"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transcript Section */}
                  <Card className="glass-card border-secondary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        Transcript
                      </CardTitle>
                      <CardDescription>
                        También puedes pegar un texto directamente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Show interim transcript while recording */}
                      <div className="relative">
                        <Textarea
                          placeholder="El transcript aparecerá aquí mientras hablas, o pega tu texto..."
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                          className="glass-input min-h-[200px] resize-none"
                          disabled={isRecording}
                        />
                        {isRecording && interimTranscript && (
                          <div className="absolute bottom-2 left-2 right-2 bg-primary/10 border border-primary/30 rounded p-2">
                            <p className="text-sm text-primary/80 italic">{interimTranscript}...</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{transcript.split(/\s+/).filter(Boolean).length} palabras</span>
                        <span>{transcript.length} caracteres</span>
                      </div>

                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || transcript.trim().length < 20}
                        className="w-full neon-button"
                      >
                        {isAnalyzing ? (
                          <>
                            <Brain className="w-5 h-5 mr-2 animate-pulse" />
                            Analizando...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Analizar Discurso
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Tips */}
                <Card className="glass-card border-accent/20">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-accent">Consejos para un mejor análisis</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          <li>• Habla con claridad y a un ritmo natural (130-150 palabras/min ideal)</li>
                          <li>• Practica tu pitch de ventas completo</li>
                          <li>• Incluye tu propuesta de valor y llamada a la acción</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="space-y-6">
                {selectedScan ? (
                  <ScanResults scan={selectedScan} onBack={() => setActiveTab("record")} />
                ) : (
                  <Card className="glass-card p-12 text-center">
                    <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Graba o pega un discurso para ver los resultados del análisis
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("record")}
                    >
                      Ir a Grabar
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                {isLoadingScans ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 mx-auto animate-pulse text-primary" />
                    <p className="text-muted-foreground mt-2">Cargando historial...</p>
                  </div>
                ) : scans.length === 0 ? (
                  <Card className="glass-card p-12 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Aún no tienes análisis. ¡Graba tu primer discurso!
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {scans.map((scan) => (
                      <Card 
                        key={scan.id} 
                        className="glass-card hover:border-primary/40 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedScan(scan);
                          setActiveTab("results");
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <ProgressRing
                                progress={scan.closing_score}
                                size={60}
                                strokeWidth={4}
                                color={scan.closing_score >= 70 ? "primary" : scan.closing_score >= 40 ? "accent" : "secondary"}
                              >
                                <span className={cn("text-sm font-bold", getScoreColor(scan.closing_score))}>
                                  {scan.closing_score}
                                </span>
                              </ProgressRing>
                              
                              <div>
                                <h3 className="font-medium">{scan.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(scan.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {scan.words_per_minute || 0} ppm
                                  </Badge>
                                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                                    {scan.filler_words_count} muletillas
                                  </Badge>
                                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                    {scan.persuasive_keywords_count} palabras clave
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScan(scan.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// Scan Results Component
function ScanResults({ scan, onBack }: { scan: NeuroScan; onBack: () => void }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "primary";
    if (score >= 60) return "accent";
    return "secondary";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Maestro del Cierre";
    if (score >= 80) return "Experto";
    if (score >= 70) return "Avanzado";
    if (score >= 60) return "Intermedio";
    if (score >= 40) return "En Desarrollo";
    return "Principiante";
  };

  return (
    <div className="space-y-6">
      {/* Score Hero */}
      <Card className="glass-card border-primary/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <CardContent className="relative py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ProgressRing
              progress={scan.closing_score}
              size={180}
              strokeWidth={12}
              color={getScoreColor(scan.closing_score)}
            >
              <div className="text-center">
                <span className="text-4xl font-bold text-gradient">{scan.closing_score}</span>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </div>
            </ProgressRing>
            
            <div className="text-center md:text-left">
              <Badge className="mb-2" variant="outline">
                {getScoreLabel(scan.closing_score)}
              </Badge>
              <h2 className="text-2xl font-heading font-bold">{scan.title}</h2>
              <p className="text-muted-foreground mt-1">
                {format(new Date(scan.created_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Volume2 className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{scan.words_per_minute || 0}</p>
            <p className="text-xs text-muted-foreground">Palabras/min</p>
            <Progress 
              value={Math.min(100, ((scan.words_per_minute || 0) / 150) * 100)} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold text-destructive">{scan.filler_words_count}</p>
            <p className="text-xs text-muted-foreground">Muletillas</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{scan.persuasive_keywords_count}</p>
            <p className="text-xs text-muted-foreground">Palabras Persuasivas</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-secondary/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-secondary mb-2" />
            <p className="text-2xl font-bold">{Math.floor((scan.duration_seconds || 0) / 60)}:{((scan.duration_seconds || 0) % 60).toString().padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground">Duración</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tone & Feedback */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Análisis de Tono
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{scan.tone_analysis}</p>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">{scan.ai_feedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* Words Detected */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Palabras Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Palabras Persuasivas:</p>
              <div className="flex flex-wrap gap-2">
                {scan.persuasive_keywords_detected.length > 0 ? (
                  scan.persuasive_keywords_detected.map((word, i) => (
                    <Badge key={i} className="bg-primary/20 text-primary border-primary/30">
                      {word}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">Ninguna detectada</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Muletillas:</p>
              <div className="flex flex-wrap gap-2">
                {scan.filler_words_detected.length > 0 ? (
                  scan.filler_words_detected.map((word, i) => (
                    <Badge key={i} variant="destructive" className="bg-destructive/20">
                      {word}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-primary italic">¡Excelente! Sin muletillas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scan.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Áreas de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scan.improvements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Transcript */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Transcript Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {scan.transcript}
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onBack}>
        ← Nuevo Análisis
      </Button>
    </div>
  );
}
