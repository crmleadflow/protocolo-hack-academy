import React, { useState } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Video,
  Book,
  Loader2,
  Upload,
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
import { useMentorDocuments } from "@/hooks/useMentor";
import { usePrograms } from "@/hooks/usePrograms";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const MentorDocumentsPanel: React.FC = () => {
  const { documents, isLoading, addDocument, deleteDocument } = useMentorDocuments();
  const { programs } = usePrograms();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [documentType, setDocumentType] = useState<string>("transcript");
  const [programId, setProgramId] = useState<string>("");
  const [timestampStart, setTimestampStart] = useState("");
  const [timestampEnd, setTimestampEnd] = useState("");

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDocumentType("transcript");
    setProgramId("");
    setTimestampStart("");
    setTimestampEnd("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await addDocument({
        title,
        content,
        document_type: documentType,
        program_id: programId || undefined,
        video_timestamp_start: parseTimestamp(timestampStart),
        video_timestamp_end: parseTimestamp(timestampEnd),
      });
      resetForm();
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
  };

  const getDocTypeIcon = (type: string) => {
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
            Sube transcripciones y contenido para entrenar al mentor
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pega aquí la transcripción o el contenido del documento..."
                  rows={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este contenido será usado por la IA para responder preguntas de los alumnos
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
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
            Agrega transcripciones de tus cursos para que el mentor pueda responder preguntas
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
                {getDocTypeIcon(doc.document_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{doc.title}</h4>
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
