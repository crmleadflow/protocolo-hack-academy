import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MentorSettings {
  id: string;
  avatar_url: string | null;
  mentor_name: string;
  welcome_message: string;
}

interface MentorMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  created_at?: string;
}

interface Citation {
  document_id: string;
  lesson_id: string | null;
  program_id: string | null;
  program_title: string | null;
  lesson_title: string | null;
  timestamp: number | null;
  quote: string;
}

interface MentorDocument {
  id: string;
  title: string;
  content: string;
  document_type: string;
  program_id: string | null;
  lesson_id: string | null;
  video_timestamp_start: number | null;
  video_timestamp_end: number | null;
  file_url: string | null;
  is_processed: boolean;
  created_at: string;
  programs?: { id: string; title: string } | null;
  lessons?: { id: string; title: string } | null;
}

export function useMentorSettings() {
  const [settings, setSettings] = useState<MentorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-settings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch settings");
      
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Error fetching mentor settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = async (updates: Partial<MentorSettings>) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to update settings");

      const data = await response.json();
      setSettings(data.settings);
      toast({ title: "Configuración actualizada" });
      return data.settings;
    } catch (error) {
      console.error("Error updating mentor settings:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, isLoading, updateSettings, refetch: fetchSettings };
}

export function useMentorChat() {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: MentorMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, conversationId }),
        }
      );

      if (response.status === 429) {
        toast({
          title: "Límite de uso alcanzado",
          description: "Intenta de nuevo más tarde",
          variant: "destructive",
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: "Créditos agotados",
          description: "Se requieren más créditos de IA",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: MentorMessage = {
        role: "assistant",
        content: data.message,
        citations: data.citations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    conversationId,
  };
}

export function useMentorDocuments() {
  const [documents, setDocuments] = useState<MentorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-documents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch documents");

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching mentor documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addDocument = async (doc: {
    title: string;
    content: string;
    document_type?: string;
    program_id?: string;
    lesson_id?: string;
    video_timestamp_start?: number;
    video_timestamp_end?: number;
    file_url?: string;
  }): Promise<MentorDocument> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(doc),
        }
      );

      if (!response.ok) throw new Error("Failed to add document");

      const data = await response.json();
      setDocuments((prev) => [data.document, ...prev]);
      toast({ title: "Documento agregado" });
      return data.document;
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el documento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-documents?id=${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete document");

      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      toast({ title: "Documento eliminado" });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, isLoading, addDocument, deleteDocument, refetch: fetchDocuments };
}
