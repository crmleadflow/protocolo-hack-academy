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

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get mentor settings
    const { data: mentorSettings } = await supabaseClient
      .from("mentor_settings")
      .select("*")
      .limit(1)
      .single();

    // Get an admin user to post as mentor
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

    // Get all published programs
    const { data: programs, error: programsError } = await supabaseClient
      .from("programs")
      .select("id, title, description")
      .eq("is_published", true);

    if (programsError || !programs?.length) {
      return new Response(JSON.stringify({ error: "No programs found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { program: string; postId?: string; error?: string }[] = [];

    for (const program of programs) {
      try {
        // Get training documents for this program
        const { data: documents } = await supabaseClient
          .from("mentor_documents")
          .select("title, content, document_type")
          .eq("is_processed", true)
          .or(`program_id.eq.${program.id},program_id.is.null`)
          .limit(10);

        // Get recent posts to avoid repetition
        const { data: recentPosts } = await supabaseClient
          .from("community_posts")
          .select("title, content")
          .eq("program_id", program.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const recentTopics = recentPosts?.map(p => p.title).join(", ") || "ninguno";

        // Build context from documents
        let knowledgeContext = "";
        if (documents && documents.length > 0) {
          documents.forEach((doc: any) => {
            knowledgeContext += `\n---\nTÍTULO: ${doc.title}\nCONTENIDO:\n${doc.content.substring(0, 1500)}\n`;
          });
        }

        // Generate content idea with AI
        const systemPrompt = `Eres ${mentorSettings?.mentor_name || "Héctor Galensky"}, un experto en ventas, persuasión y desarrollo personal.
Tu misión es crear contenido educativo valioso para la comunidad del programa "${program.title}".

DESCRIPCIÓN DEL PROGRAMA:
${program.description || "Programa de formación especializado"}

CONOCIMIENTO DISPONIBLE:
${knowledgeContext || "Sin contenido específico aún."}

TEMAS RECIENTES YA PUBLICADOS (evitar repetir):
${recentTopics}

TIPOS DE CONTENIDO A CREAR (elige uno):
1. 💡 TIP DEL DÍA: Un consejo práctico y accionable
2. 📊 DATO INTERESANTE: Estadística o hecho relevante del sector
3. 🎯 DESAFÍO SEMANAL: Una pequeña tarea para practicar
4. 📚 RECURSO RECOMENDADO: Libro, video o herramienta útil
5. 💬 REFLEXIÓN: Una pregunta para generar discusión
6. 🔥 MOTIVACIÓN: Frase inspiradora con contexto práctico

REGLAS:
1. El contenido debe ser ÚNICO y VALIOSO
2. No repetir temas recientes
3. Mantén un tono cercano y profesional
4. Incluye emojis para hacerlo visual
5. El título debe ser atractivo (máx 80 caracteres)
6. El contenido debe ser conciso pero sustancioso (150-300 palabras)
7. Termina invitando a la interacción
8. Responde SIEMPRE en español`;

        const userMessage = `Genera una publicación educativa nueva y relevante para la comunidad.

Responde en formato JSON exacto:
{
  "title": "Título atractivo aquí",
  "content": "Contenido completo aquí",
  "type": "discussion"
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("AI Gateway error:", aiResponse.status, errorText);
          results.push({ program: program.title, error: `AI error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const responseText = aiData.choices?.[0]?.message?.content;

        if (!responseText) {
          results.push({ program: program.title, error: "No AI response" });
          continue;
        }

        // Parse JSON response
        let postData;
        try {
          postData = JSON.parse(responseText);
        } catch {
          // Try to extract JSON from the response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            postData = JSON.parse(jsonMatch[0]);
          } else {
            results.push({ program: program.title, error: "Invalid JSON response" });
            continue;
          }
        }

        // Format the content with mentor signature
        const formattedContent = `🤖 **Publicación del Mentor IA**\n\n${postData.content}\n\n---\n_Contenido generado por ${mentorSettings?.mentor_name || "Héctor Galensky"} (Mentor Virtual) para mantenerte actualizado y motivado._`;

        // Create the post
        const { data: newPost, error: postError } = await supabaseClient
          .from("community_posts")
          .insert({
            program_id: program.id,
            user_id: mentorProfile.user_id,
            title: `🤖 ${postData.title}`,
            content: formattedContent,
            content_type: "discussion",
            is_pinned: false,
          })
          .select("id")
          .single();

        if (postError) {
          console.error("Error creating post:", postError);
          results.push({ program: program.title, error: postError.message });
        } else {
          results.push({ program: program.title, postId: newPost.id });
        }
      } catch (error) {
        console.error(`Error processing program ${program.title}:`, error);
        results.push({ 
          program: program.title, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scheduled content error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
