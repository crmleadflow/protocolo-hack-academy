import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Video,
  Book,
  Loader2,
  Upload,
  File,
  FileImage,
  FileAudio,
  FileVideo,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useMentorDocuments } from "@/hooks/useMentor";
import { usePrograms } from "@/hooks/usePrograms";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return <FileImage className="w-4 h-4" />;
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) {
    return <FileAudio className="w-4 h-4" />;
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return <FileVideo className="w-4 h-4" />;
  }
  if (['pdf'].includes(ext)) {
    return <FileText className="w-4 h-4" />;
  }
  return <File className="w-4 h-4" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const MentorDocumentsPanel: React.FC = () => {
  const { documents, isLoading, addDocument, deleteDocument } = useMentorDocuments();
  const { programs } = usePrograms();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"text" | "file">("text");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [documentType, setDocumentType] = useState<string>("transcript");
  const [programId, setProgramId] = useState<string>("");
  const [timestampStart, setTimestampStart] = useState("");
  const [timestampEnd, setTimestampEnd] = useState("");
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDocumentType("transcript");
    setProgramId("");
    setTimestampStart("");
    setTimestampEnd("");
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadMode("text");
  };

  const parseTimestamp = (ts: string): number | undefined => {
    if (!ts) return undefined;
    const parts = ts.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return undefined;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: `El archivo no puede superar ${formatFileSize(MAX_FILE_SIZE)}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title if empty
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }

    // Detect document type based on extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['txt', 'md', 'rtf'].includes(ext)) {
      setDocumentType("text");
      // Read text content
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
      };
      reader.readAsText(file);
    } else if (['pdf'].includes(ext)) {
      setDocumentType("pdf");
    } else if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
      setDocumentType("transcript");
    } else {
      setDocumentType("notes");
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("No autenticado");

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${sessionData.session.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('mentor-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get signed URL for private bucket
    const { data: urlData, error: urlError } = await supabase.storage
      .from('mentor-files')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    if (urlError) throw urlError;

    return urlData.signedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === "text" && (!title.trim() || !content.trim())) {
      toast({
        title: "Campos requeridos",
        description: "El título y contenido son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (uploadMode === "file" && !selectedFile) {
      toast({
        title: "Archivo requerido",
        description: "Selecciona un archivo para subir",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(uploadMode === "file");

    try {
      let fileUrl: string | undefined;
      let finalContent = content;

      if (uploadMode === "file" && selectedFile) {
        setUploadProgress(20);
        fileUrl = await uploadFileToStorage(selectedFile);
        setUploadProgress(80);

        // If no content was extracted (non-text file), add a placeholder
        if (!finalContent.trim()) {
          finalContent = `[Archivo: ${selectedFile.name}]\n\nNota: Este archivo requiere transcripción o resumen manual para ser usado por la IA.`;
        }
      }

      await addDocument({
        title: title || selectedFile?.name || "Documento sin título",
        content: finalContent,
        document_type: documentType,
        program_id: programId || undefined,
        video_timestamp_start: parseTimestamp(timestampStart),
        video_timestamp_end: parseTimestamp(timestampEnd),
        file_url: fileUrl,
      });

      setUploadProgress(100);
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: "Documento guardado",
        description: "El documento ha sido agregado para entrenar la IA",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el documento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
  };

  const getDocTypeIcon = (type: string, fileUrl?: string | null) => {
    if (fileUrl) {
      const fileName = fileUrl.split('/').pop() || '';
      return getFileIcon(fileName);
    }
    switch (type) {
      case "transcript":
        return <Video className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "notes":
        return <Book className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "transcript":
        return "Transcripción";
      case "pdf":
        return "PDF";
      case "text":
        return "Texto";
      case "notes":
        return "Notas";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg">
            Documentos de Entrenamiento
          </h3>
          <p className="text-sm text-muted-foreground">
            Sube archivos y contenido para entrenar a Mi Mentor IA
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Documento de Entrenamiento</DialogTitle>
            </DialogHeader>
            
            <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "text" | "file")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Pegar texto
                </TabsTrigger>
                <TabsTrigger value="file" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Subir archivo
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <TabsContent value="file" className="space-y-4 mt-0">
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="*/*"
                    />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                          {getFileIcon(selectedFile.name)}
                        </div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setContent("");
                          }}
                        >
                          Cambiar archivo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="font-medium">Arrastra un archivo o haz clic para seleccionar</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, TXT, DOCX, MP4, MP3, imágenes y más (máx. 50MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subiendo archivo...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                    <p className="font-medium">💡 Consejo para archivos multimedia:</p>
                    <p className="text-muted-foreground">
                      Para videos y audios, agrega una transcripción manual en el campo de contenido. 
                      Esto permite que la IA entienda y cite el contenido correctamente.
                    </p>
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Técnicas de cierre - Módulo 3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de documento</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transcript">Transcripción de video</SelectItem>
                        <SelectItem value="text">Texto/Artículo</SelectItem>
                        <SelectItem value="notes">Notas de clase</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Programa (opcional)</Label>
                    <Select value={programId} onValueChange={setProgramId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar programa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin programa</SelectItem>
                        {programs?.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {documentType === "transcript" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Timestamp inicio (MM:SS)</Label>
                      <Input
                        value={timestampStart}
                        onChange={(e) => setTimestampStart(e.target.value)}
                        placeholder="00:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timestamp fin (MM:SS)</Label>
                      <Input
                        value={timestampEnd}
                        onChange={(e) => setTimestampEnd(e.target.value)}
                        placeholder="05:30"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Contenido {uploadMode === "text" ? "*" : "(transcripción manual)"}
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      uploadMode === "file"
                        ? "Pega aquí la transcripción del archivo (opcional para archivos de texto)"
                        : "Pega aquí la transcripción o el contenido del documento..."
                    }
                    rows={10}
                    required={uploadMode === "text"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este contenido será usado por la IA para responder preguntas de los alumnos
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? "Subiendo..." : "Guardando..."}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Guardar documento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">No hay documentos de entrenamiento</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Agrega transcripciones y archivos para que el mentor pueda responder preguntas
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar primer documento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-lg p-4 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getDocTypeIcon(doc.document_type, doc.file_url)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{doc.title}</h4>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getDocTypeLabel(doc.document_type)}</span>
                  {doc.programs && (
                    <>
                      <span>•</span>
                      <span>{doc.programs.title}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    {format(new Date(doc.created_at), "dd MMM yyyy", { locale: es })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {doc.content.substring(0, 150)}...
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(doc.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
