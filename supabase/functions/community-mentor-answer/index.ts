import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { postId, programId } = await req.json();

    if (!postId || !programId) {
      return new Response(JSON.stringify({ error: "postId and programId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the question post
    const { data: post, error: postError } = await supabaseClient
      .from("community_posts")
      .select("*")
      .eq("id", postId)
      .eq("content_type", "question")
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get program info
    const { data: program } = await supabaseClient
      .from("programs")
      .select("title")
      .eq("id", programId)
      .single();

    // Get mentor settings
    const { data: mentorSettings } = await supabaseClient
      .from("mentor_settings")
      .select("*")
      .limit(1)
      .single();

    // Get a mentor user (admin) to attribute the comment to
    const { data: mentorProfile } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!mentorProfile) {
      return new Response(JSON.stringify({ error: "No mentor available" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get training documents filtered by program
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
      .or(`program_id.eq.${programId},program_id.is.null`)
      .order("created_at", { ascending: false });

    // Build context from documents
    let knowledgeContext = "";
    
    if (documents && documents.length > 0) {
      documents.forEach((doc: any) => {
        const programTitle = doc.programs?.title || "General";
        const lessonTitle = doc.lessons?.title || doc.title;
        const timestamp = doc.video_timestamp_start 
          ? `[${Math.floor(doc.video_timestamp_start / 60)}:${String(doc.video_timestamp_start % 60).padStart(2, '0')}]` 
          : "";
        
        knowledgeContext += `\n---\nFUENTE: ${programTitle} > ${lessonTitle} ${timestamp}\nCONTENIDO:\n${doc.content}\n`;
      });
    }

    // System prompt for community questions
    const systemPrompt = `Eres ${mentorSettings?.mentor_name || "Héctor Galensky"}, el mentor virtual de esta plataforma educativa.
Estás respondiendo preguntas en la comunidad del programa "${program?.title || "este curso"}".

Tu rol es ayudar a los estudiantes respondiendo sus preguntas basándote en el conocimiento de los cursos.

REGLAS IMPORTANTES:
1. Responde como el instructor real, de forma cercana y profesional.
2. Si la información está en tu base de conocimiento, cita la fuente: "Como explico en [Lección]: [explicación]"
3. Si no tienes información específica, da una respuesta general útil y sugiere explorar las lecciones relevantes.
4. Mantén las respuestas concisas pero completas (máximo 3-4 párrafos).
5. Incluye consejos prácticos cuando sea apropiado.
6. Anima al estudiante a seguir aprendiendo.
7. Responde SIEMPRE en español.

BASE DE CONOCIMIENTO DEL PROGRAMA:
${knowledgeContext || "No hay contenido de entrenamiento específico para este programa aún. Responde de forma general basándote en el tema de la pregunta."}`;

    const userMessage = `PREGUNTA DE LA COMUNIDAD:

Título: ${post.title}

${post.content}

---
Responde esta pregunta de forma útil y educativa.`;

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
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const mentorResponse = aiData.choices?.[0]?.message?.content;

    if (!mentorResponse) {
      throw new Error("No response from AI");
    }

    // Format the response with mentor signature
    const formattedResponse = `🤖 **${mentorSettings?.mentor_name || "Héctor Galensky"} (Mentor IA)**\n\n${mentorResponse}\n\n---\n_Esta respuesta fue generada automáticamente por el mentor virtual. Para una conversación más detallada, visita la sección "Mi Mentor"._`;

    // Create comment as the mentor
    const { data: comment, error: commentError } = await supabaseClient
      .from("community_comments")
      .insert({
        post_id: postId,
        user_id: mentorProfile.user_id,
        content: formattedResponse,
      })
      .select()
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      throw commentError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        commentId: comment.id,
        response: mentorResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Community mentor answer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
