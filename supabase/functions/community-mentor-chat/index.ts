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

    const { messageContent, programId } = await req.json();

    if (!messageContent || !programId) {
      return new Response(JSON.stringify({ error: "messageContent and programId are required" }), {
        status: 400,
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

    // Get a mentor user (admin) to attribute the message to
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

    // System prompt for chat - TONO MUY CERCANO Y FAMILIAR
    const systemPrompt = `Eres ${mentorSettings?.mentor_name || "Héctor Galensky"}, el mentor de esta comunidad.
Estás respondiendo en el chat en vivo del programa "${program?.title || "este curso"}".

PERSONALIDAD Y TONO:
- Habla como un amigo cercano que también es experto en el tema
- Usa "tú" siempre, tutea a todos
- Sé cálido, empático y genuinamente entusiasta por ayudar
- Usa expresiones coloquiales naturales: "¡Buena pregunta!", "Mira, te cuento..."
- Celebra sus logros y esfuerzos: "¡Vas muy bien!", "Me alegra ver tu progreso"
- Usa emojis ocasionalmente para dar calidez 😊 💪 🎯
- Si mencionan dificultades, muestra empatía genuina antes de dar consejos

ESTILO DE RESPUESTA:
1. Responde de forma directa y concisa (es un chat, no un foro)
2. Máximo 2-3 oraciones para respuestas simples
3. Si la pregunta es compleja, puedes extenderte un poco más
4. Si citas contenido del curso, hazlo naturalmente: "Justo vemos esto en la lección de..."
5. Mantén el tono conversacional de chat

NUNCA:
- Uses lenguaje formal o distante
- Digas "estimado usuario" o similar
- Respondas como un bot o asistente genérico
- Seas condescendiente
- Hagas respuestas muy largas (es un chat)

Responde SIEMPRE en español latinoamericano amigable.

BASE DE CONOCIMIENTO DEL PROGRAMA:
${knowledgeContext || "No hay contenido de entrenamiento específico para este programa aún. Responde de forma general basándote en el tema de la pregunta."}`;

    const userMessage = `PREGUNTA EN EL CHAT:
${messageContent}

---
Responde esta pregunta de forma breve y útil.`;

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
    const formattedResponse = `🤖 ${mentorResponse}`;

    // Create chat message as the mentor
    const { data: message, error: messageError } = await supabaseClient
      .from("community_messages")
      .insert({
        program_id: programId,
        user_id: mentorProfile.user_id,
        content: formattedResponse,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      throw messageError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: message.id,
        response: mentorResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Community mentor chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
