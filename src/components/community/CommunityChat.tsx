import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  FileArchive,
  Download,
  Loader2,
  MessagesSquare,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCommunityChat, ChatMessage } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommunityChatProps {
  programId: string;
  programTitle: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return FileText;
  if (fileType.startsWith("image/")) return ImageIcon;
  if (fileType.startsWith("video/")) return Film;
  if (fileType.startsWith("audio/")) return Music;
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) return FileArchive;
  return FileText;
}

function isImageFile(fileType: string | null) {
  return fileType?.startsWith("image/") || false;
}

function isVideoFile(fileType: string | null) {
  return fileType?.startsWith("video/") || false;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({
  programId,
  programTitle,
}) => {
  const { user } = useAuth();
  const { messages, isLoading, isUploading, sendMessage, uploadFile } = useCommunityChat(programId);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [selectedFile]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [newMessage]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    try {
      let fileData;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      }

      await sendMessage(newMessage, fileData || undefined);
      setNewMessage("");
      setSelectedFile(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 100MB.");
        return;
      }
      setSelectedFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[500px] md:h-[600px] glass-card rounded-2xl p-4">
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessagesSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold">
              Chat de {programTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {messages.length} mensajes • Comparte archivos y videos
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">En vivo</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <MessagesSquare className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Sin mensajes aún</h4>
            <p className="text-sm text-muted-foreground">
              ¡Sé el primero en escribir!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.user_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                {React.createElement(getFileIcon(selectedFile.type), { className: "w-6 h-6 text-primary" })}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeSelectedFile}
              className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-background/50">
        <div className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isUploading}
            className="flex-shrink-0 hover:bg-primary/10 hover:text-primary"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className={cn(
                "w-full min-h-[44px] max-h-[120px] resize-none rounded-xl",
                "bg-background/60 border border-border/50 px-4 py-3 pr-12",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isSending || isUploading}
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
            size="icon"
            className={cn(
              "flex-shrink-0 rounded-xl h-11 w-11 transition-all duration-200",
              (newMessage.trim() || selectedFile) 
                ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {isSending || isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Presiona Enter para enviar • Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const hasFile = !!message.file_url;
  const isImage = isImageFile(message.file_type);
  const isVideo = isVideoFile(message.file_type);
  const FileIcon = getFileIcon(message.file_type);

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-primary/20">
        <AvatarImage src={message.author?.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
          {message.author?.full_name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn("max-w-[75%] sm:max-w-[70%]", isOwn && "text-right")}>
        <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
          <span className="text-sm font-medium">
            {message.author?.full_name || "Usuario"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
        
        <div
          className={cn(
            "inline-block rounded-2xl overflow-hidden",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-background/60 border border-border/50 rounded-tl-md"
          )}
        >
          {/* File attachment */}
          {hasFile && (
            <div className={cn("p-1", message.content && "pb-0")}>
              {isImage ? (
                <img
                  src={message.file_url!}
                  alt={message.file_name || "Image"}
                  className="max-w-[280px] sm:max-w-[320px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.file_url!, "_blank")}
                />
              ) : isVideo ? (
                <video
                  src={message.file_url!}
                  controls
                  className="max-w-[280px] sm:max-w-[320px] rounded-xl"
                />
              ) : (
                <a
                  href={message.file_url!}
                  download={message.file_name}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors",
                    isOwn 
                      ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" 
                      : "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isOwn ? "bg-primary-foreground/20" : "bg-primary/10"
                  )}>
                    <FileIcon className={cn("w-5 h-5", isOwn ? "text-primary-foreground" : "text-primary")} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{message.file_name}</p>
                    <p className={cn("text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {message.file_size ? formatFileSize(message.file_size) : "Archivo"}
                    </p>
                  </div>
                  <Download className={cn("w-5 h-5 flex-shrink-0", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")} />
                </a>
              )}
            </div>
          )}
          
          {/* Text content */}
          {message.content && (
            <p className="p-3 text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};
