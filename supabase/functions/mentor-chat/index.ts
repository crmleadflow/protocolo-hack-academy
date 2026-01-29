import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Citation {
  document_id: string;
  lesson_id: string | null;
  program_id: string | null;
  program_title: string | null;
  lesson_title: string | null;
  timestamp: number | null;
  quote: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, conversationId } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get mentor settings
    const { data: mentorSettings } = await supabaseClient
      .from("mentor_settings")
      .select("*")
      .limit(1)
      .single();

    // Get all training documents for context
    const { data: documents } = await supabaseClient
      .from("mentor_documents")
      .select(`
        id,
        title,
        content,
        document_type,
        video_timestamp_start,
        video_timestamp_end,
        program_id,
        lesson_id,
        programs:program_id (title),
        lessons:lesson_id (title, video_url)
      `)
      .eq("is_processed", true)
      .order("created_at", { ascending: false });

    // Build context from documents
    let knowledgeContext = "";
    const documentMap = new Map();
    
    if (documents && documents.length > 0) {
      documents.forEach((doc: any) => {
        documentMap.set(doc.id, doc);
        const programTitle = doc.programs?.title || "General";
        const lessonTitle = doc.lessons?.title || doc.title;
        const timestamp = doc.video_timestamp_start 
          ? `[${Math.floor(doc.video_timestamp_start / 60)}:${String(doc.video_timestamp_start % 60).padStart(2, '0')}]` 
          : "";
        
        knowledgeContext += `\n---\nFUENTE: ${programTitle} > ${lessonTitle} ${timestamp}\nCONTENIDO:\n${doc.content}\n`;
      });
    }

    // Create or get conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabaseClient
        .from("mentor_conversations")
        .insert({ user_id: authData.user.id, title: message.substring(0, 50) })
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = newConv.id;
    }

    // Save user message
    await supabaseClient.from("mentor_messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: message,
    });

    // Get conversation history
    const { data: history } = await supabaseClient
      .from("mentor_messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const conversationHistory = history?.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    // System prompt for the mentor
    const systemPrompt = `Eres ${mentorSettings?.mentor_name || "Héctor Galensky"}, el mentor virtual de esta plataforma educativa. 
Tu rol es responder preguntas de los estudiantes basándote EXCLUSIVAMENTE en el conocimiento de los cursos que se te proporciona.

REGLAS IMPORTANTES:
1. SIEMPRE responde como si fueras el instructor real hablando directamente al alumno.
2. Cuando cites información, SIEMPRE indica la fuente exacta (curso, lección, y timestamp si está disponible).
3. Usa el formato: "Como explico en [Nombre del Curso] > [Lección] a las [MM:SS]: [cita textual]"
4. Si no tienes información sobre algo en tu base de conocimiento, dilo claramente y sugiere qué cursos podrían ser relevantes.
5. Mantén un tono cercano, motivador y profesional.
6. Responde en español.

BASE DE CONOCIMIENTO:
${knowledgeContext || "No hay contenido de entrenamiento disponible aún. Puedes responder preguntas generales pero indica que el mentor necesita ser entrenado con contenido específico."}`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || "Lo siento, no pude generar una respuesta.";

    // Extract citations from the response (simple pattern matching)
    const citations: Citation[] = [];
    const citationPattern = /(?:como explico en|en|según)\s+\[?([^\]>]+)\]?\s*>\s*\[?([^\]]+)\]?\s*(?:a las?\s*\[?(\d{1,2}:\d{2})\]?)?/gi;
    let match;
    while ((match = citationPattern.exec(assistantMessage)) !== null) {
      const programTitle = match[1]?.trim();
      const lessonTitle = match[2]?.trim();
      const timestamp = match[3];
      
      // Find matching document
      for (const [docId, doc] of documentMap) {
        const docProgram = (doc as any).programs?.title;
        const docLesson = (doc as any).lessons?.title || (doc as any).title;
        
        if ((programTitle && docProgram?.toLowerCase().includes(programTitle.toLowerCase())) ||
            (lessonTitle && docLesson?.toLowerCase().includes(lessonTitle.toLowerCase()))) {
          let timestampSeconds = null;
          if (timestamp) {
            const [mins, secs] = timestamp.split(":").map(Number);
            timestampSeconds = mins * 60 + secs;
          }
          
          citations.push({
            document_id: docId,
            lesson_id: (doc as any).lesson_id,
            program_id: (doc as any).program_id,
            program_title: docProgram,
            lesson_title: docLesson,
            timestamp: timestampSeconds || (doc as any).video_timestamp_start,
            quote: "",
          });
          break;
        }
      }
    }

    // Save assistant message
    await supabaseClient.from("mentor_messages").insert({
      conversation_id: currentConversationId,
      role: "assistant",
      content: assistantMessage,
      citations: citations,
    });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: currentConversationId,
        citations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Mentor chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
