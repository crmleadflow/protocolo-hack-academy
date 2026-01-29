import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  recipient_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Student {
  id: string;
  user_id: string;
  full_name: string | null;
}

export function useDirectMessages() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<{ user_id: string; full_name: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for senders and recipients
      const userIds = new Set<string>();
      data?.forEach((msg) => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      const messagesWithProfiles = data?.map((msg) => ({
        ...msg,
        sender_profile: profileMap.get(msg.sender_id),
        recipient_profile: profileMap.get(msg.recipient_id),
      })) || [];

      setMessages(messagesWithProfiles);
      setUnreadCount(messagesWithProfiles.filter((m) => m.recipient_id === user.id && !m.is_read).length);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!isAdmin) return;

    try {
      // First get all user_ids with 'student' role
      const { data: studentRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (rolesError) throw rolesError;

      const studentUserIds = studentRoles?.map((r) => r.user_id) || [];

      if (studentUserIds.length === 0) {
        setStudents([]);
        return;
      }

      // Then get profiles for those students
      const { data: studentProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name")
        .in("user_id", studentUserIds);

      if (profilesError) throw profilesError;
      setStudents(studentProfiles || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAdmins = async () => {
    if (!user) return;

    try {
      // Get admin user IDs
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      const adminUserIds = adminRoles?.map((r) => r.user_id) || [];

      // Get admin profiles
      const { data: adminProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", adminUserIds);

      if (profilesError) throw profilesError;
      setAdmins(adminProfiles || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const sendMessage = async (recipientId: string, subject: string, content: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase.from("direct_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject,
        content,
      });

      if (error) throw error;

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente",
      });

      fetchMessages();
      return { error: null };
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
      return { error };
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .eq("recipient_id", user.id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user || !isAdmin) return { error: new Error("Not authorized") };

    try {
      const { error } = await supabase
        .from("direct_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado correctamente",
      });

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      return { error: null };
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el mensaje",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
      if (isAdmin) {
        fetchStudents();
      } else {
        fetchAdmins();
      }
    }
  }, [user, isAdmin]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("direct_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    messages,
    students,
    admins,
    isLoading,
    unreadCount,
    sendMessage,
    markAsRead,
    deleteMessage,
    refetch: fetchMessages,
  };
}
