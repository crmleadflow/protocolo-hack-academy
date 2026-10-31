export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_status: {
        Row: {
          reason: string | null
          status: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          reason?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          reason?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at: string
          description: string
          icon: string
          id: string
          is_hidden: boolean
          name: string
          requirement_type: string
          requirement_value: number
          sort_order: number
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          description: string
          icon?: string
          id?: string
          is_hidden?: boolean
          name: string
          requirement_type: string
          requirement_value?: number
          sort_order?: number
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_hidden?: boolean
          name?: string
          requirement_type?: string
          requirement_value?: number
          sort_order?: number
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      commercial_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          request_type: string
          source_page: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          request_type: string
          source_page?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          request_type?: string
          source_page?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_accepted_answer: boolean
          likes_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_accepted_answer?: boolean
          likes_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_accepted_answer?: boolean
          likes_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          program_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          program_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          program_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number
          content: string
          content_type: Database["public"]["Enums"]["community_content_type"]
          created_at: string
          id: string
          is_pinned: boolean
          is_resolved: boolean
          likes_count: number
          program_id: string
          title: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          comments_count?: number
          content: string
          content_type?: Database["public"]["Enums"]["community_content_type"]
          created_at?: string
          id?: string
          is_pinned?: boolean
          is_resolved?: boolean
          likes_count?: number
          program_id: string
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          comments_count?: number
          content?: string
          content_type?: Database["public"]["Enums"]["community_content_type"]
          created_at?: string
          id?: string
          is_pinned?: boolean
          is_resolved?: boolean
          likes_count?: number
          program_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_outbox: {
        Row: {
          attempts: number
          created_at: string
          destination: string
          id: string
          intent_event_id: string | null
          last_error: string | null
          payload: Json
          sent_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          destination?: string
          id?: string
          intent_event_id?: string | null
          last_error?: string | null
          payload: Json
          sent_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          destination?: string
          id?: string
          intent_event_id?: string | null
          last_error?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_outbox_intent_event_id_fkey"
            columns: ["intent_event_id"]
            isOneToOne: false
            referencedRelation: "intent_events"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          created_at: string
          enrolled_at: string | null
          enrolled_by: string | null
          expires_at: string | null
          id: string
          is_manual: boolean
          payment_id: string | null
          program_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enrolled_at?: string | null
          enrolled_by?: string | null
          expires_at?: string | null
          id?: string
          is_manual?: boolean
          payment_id?: string | null
          program_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enrolled_at?: string | null
          enrolled_by?: string | null
          expires_at?: string | null
          id?: string
          is_manual?: boolean
          payment_id?: string | null
          program_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          granted_at: string
          id: string
          order_id: string | null
          product_id: string
          product_type: string
          status: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          product_type: string
          status?: string
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          product_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      intent_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page_url: string | null
          request_id: string | null
          user_id: string | null
          utm: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          page_url?: string | null
          request_id?: string | null
          user_id?: string | null
          utm?: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page_url?: string | null
          request_id?: string | null
          user_id?: string | null
          utm?: Json
        }
        Relationships: []
      }
      lesson_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          last_position_seconds: number | null
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_ratings: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_ratings_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          lesson_id: string
          sort_order: number
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          lesson_id: string
          sort_order?: number
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          lesson_id?: string
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_preview: boolean
          module_id: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_preview?: boolean
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_preview?: boolean
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_documents: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          document_type: Database["public"]["Enums"]["mentor_document_type"]
          file_url: string | null
          id: string
          is_processed: boolean
          lesson_id: string | null
          metadata: Json | null
          program_id: string | null
          title: string
          updated_at: string
          video_timestamp_end: number | null
          video_timestamp_start: number | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["mentor_document_type"]
          file_url?: string | null
          id?: string
          is_processed?: boolean
          lesson_id?: string | null
          metadata?: Json | null
          program_id?: string | null
          title: string
          updated_at?: string
          video_timestamp_end?: number | null
          video_timestamp_start?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["mentor_document_type"]
          file_url?: string | null
          id?: string
          is_processed?: boolean
          lesson_id?: string | null
          metadata?: Json | null
          program_id?: string | null
          title?: string
          updated_at?: string
          video_timestamp_end?: number | null
          video_timestamp_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_documents_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_documents_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string
          embedding: Json | null
          id: string
          video_timestamp: number | null
        }
        Insert: {
          chunk_index?: number
          chunk_text: string
          created_at?: string
          document_id: string
          embedding?: Json | null
          id?: string
          video_timestamp?: number | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string
          embedding?: Json | null
          id?: string
          video_timestamp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "mentor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_messages: {
        Row: {
          citations: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          citations?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          citations?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_settings: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          mentor_name: string
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          mentor_name?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          mentor_name?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          program_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          program_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          program_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      neuro_scans: {
        Row: {
          ai_feedback: string | null
          closing_score: number
          created_at: string
          duration_seconds: number | null
          filler_words_count: number | null
          filler_words_detected: Json | null
          id: string
          improvements: Json | null
          persuasive_keywords_count: number | null
          persuasive_keywords_detected: Json | null
          strengths: Json | null
          title: string
          tone_analysis: string | null
          transcript: string
          updated_at: string
          user_id: string
          words_per_minute: number | null
        }
        Insert: {
          ai_feedback?: string | null
          closing_score?: number
          created_at?: string
          duration_seconds?: number | null
          filler_words_count?: number | null
          filler_words_detected?: Json | null
          id?: string
          improvements?: Json | null
          persuasive_keywords_count?: number | null
          persuasive_keywords_detected?: Json | null
          strengths?: Json | null
          title?: string
          tone_analysis?: string | null
          transcript: string
          updated_at?: string
          user_id: string
          words_per_minute?: number | null
        }
        Update: {
          ai_feedback?: string | null
          closing_score?: number
          created_at?: string
          duration_seconds?: number | null
          filler_words_count?: number | null
          filler_words_detected?: Json | null
          id?: string
          improvements?: Json | null
          persuasive_keywords_count?: number | null
          persuasive_keywords_detected?: Json | null
          strengths?: Json | null
          title?: string
          tone_analysis?: string | null
          transcript?: string
          updated_at?: string
          user_id?: string
          words_per_minute?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_type: string
          quantity: number
          title: string
          unit_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_type: string
          quantity?: number
          title: string
          unit_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_type?: string
          quantity?: number
          title?: string
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          checkout_session_id: string | null
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          provider: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checkout_session_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider?: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checkout_session_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          payment_data: Json | null
          paypal_order_id: string | null
          paypal_payer_id: string | null
          program_id: string | null
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_data?: Json | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          program_id?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_data?: Json | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          program_id?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_tools: {
        Row: {
          created_at: string
          id: string
          program_id: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_id: string
          tool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_tools_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          is_published: boolean
          price: number
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          visibility_status: Database["public"]["Enums"]["visibility_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_published?: boolean
          price?: number
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          visibility_status?: Database["public"]["Enums"]["visibility_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_published?: boolean
          price?: number
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          visibility_status?: Database["public"]["Enums"]["visibility_status"]
        }
        Relationships: []
      }
      tool_subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          payment_data: Json | null
          status: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          payment_data?: Json | null
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          payment_data?: Json | null
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_subscriptions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          price_monthly: number
          price_yearly: number
          sort_order: number
          thumbnail_url: string | null
          title: string
          tool_type: string
          tool_url: string | null
          updated_at: string
          visibility_status: Database["public"]["Enums"]["visibility_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          tool_type?: string
          tool_url?: string | null
          updated_at?: string
          visibility_status?: Database["public"]["Enums"]["visibility_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          tool_type?: string
          tool_url?: string | null
          updated_at?: string
          visibility_status?: Database["public"]["Enums"]["visibility_status"]
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          new_content_alerts: boolean
          progress_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          new_content_alerts?: boolean
          progress_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          new_content_alerts?: boolean
          progress_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          lessons_completed: number
          longest_streak: number
          modules_completed: number
          programs_completed: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          modules_completed?: number
          programs_completed?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          modules_completed?: number
          programs_completed?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_xp: {
        Args: { _user_id: string; _xp_amount: number }
        Returns: undefined
      }
      has_active_enrollment: {
        Args: { _program_id: string; _user_id: string }
        Returns: boolean
      }
      has_active_tool_subscription: {
        Args: { _tool_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tool_access: {
        Args: { _tool_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      achievement_category: "progress" | "social" | "milestone"
      app_role: "admin" | "student" | "super_admin" | "mentor" | "member"
      billing_cycle: "monthly" | "yearly" | "one_time"
      community_content_type: "discussion" | "question" | "announcement"
      enrollment_status: "pending" | "active" | "expired" | "cancelled"
      mentor_document_type: "transcript" | "pdf" | "text" | "notes"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      product_type: "program" | "tool"
      visibility_status: "published" | "coming_soon" | "draft"
      vote_type: "up" | "down"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_category: ["progress", "social", "milestone"],
      app_role: ["admin", "student", "super_admin", "mentor", "member"],
      billing_cycle: ["monthly", "yearly", "one_time"],
      community_content_type: ["discussion", "question", "announcement"],
      enrollment_status: ["pending", "active", "expired", "cancelled"],
      mentor_document_type: ["transcript", "pdf", "text", "notes"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      product_type: ["program", "tool"],
      visibility_status: ["published", "coming_soon", "draft"],
      vote_type: ["up", "down"],
    },
  },
} as const
