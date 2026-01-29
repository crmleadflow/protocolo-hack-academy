import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERSUASIVE_KEYWORDS = [
  "garantizado", "exclusivo", "limitado", "ahora", "hoy", "único", "gratis",
  "descuento", "oferta", "beneficio", "solución", "resultado", "éxito",
  "transformar", "lograr", "alcanzar", "inversión", "valor", "oportunidad",
  "urgente", "inmediato", "probado", "confianza", "seguro", "fácil",
  "rápido", "simple", "mejor", "premium", "especial", "personalizado"
];

const FILLER_WORDS = [
  "ehh", "umm", "este", "o sea", "como que", "bueno", "pues", "entonces",
  "básicamente", "literalmente", "tipo", "digamos", "la verdad", "osea",
  "mmm", "ah", "eh", "em", "uh", "sabes", "entiendes", "verdad"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("No auth header");
      return new Response(JSON.stringify({ error: "Debes iniciar sesión" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Use getUser instead of getClaims for more reliability
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError?.message || "No user");
      return new Response(JSON.stringify({ error: "Sesión inválida. Por favor, vuelve a iniciar sesión." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    
    const { transcript, durationSeconds, title } = await req.json();

    if (!transcript || transcript.trim().length < 10) {
      return new Response(JSON.stringify({ error: "El transcript debe tener al menos 10 caracteres" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze transcript locally
    const words = transcript.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    const wordsPerMinute = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    // Detect filler words
    const fillerWordsDetected: string[] = [];
    let fillerCount = 0;
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = transcript.match(regex);
      if (matches) {
        fillerCount += matches.length;
        fillerWordsDetected.push(`${filler} (${matches.length}x)`);
      }
    }

    // Detect persuasive keywords
    const persuasiveDetected: string[] = [];
    let persuasiveCount = 0;
    for (const keyword of PERSUASIVE_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = transcript.match(regex);
      if (matches) {
        persuasiveCount += matches.length;
        persuasiveDetected.push(`${keyword} (${matches.length}x)`);
      }
    }

    // Call Lovable AI for deeper analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const aiPrompt = `Eres un experto en análisis de discursos de venta y persuasión. Analiza el siguiente transcript de una práctica de venta y proporciona:

1. Un análisis del tono (profesional, amigable, agresivo, inseguro, etc.)
2. 3 fortalezas específicas del discurso
3. 3 áreas de mejora específicas
4. Un puntaje de "Capacidad de Cierre" del 0 al 100 basado en:
   - Uso de palabras persuasivas (${persuasiveCount} detectadas)
   - Muletillas usadas (${fillerCount} detectadas)
   - Velocidad del discurso (${wordsPerMinute} palabras por minuto - ideal 130-150)
   - Estructura y claridad del mensaje

TRANSCRIPT:
"${transcript}"

Responde EXACTAMENTE en este formato JSON:
{
  "toneAnalysis": "descripción del tono en 1-2 oraciones",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "improvements": ["mejora 1", "mejora 2", "mejora 3"],
  "closingScore": número del 0 al 100,
  "feedback": "retroalimentación general en 2-3 oraciones motivadoras y constructivas"
}`;

    let aiAnalysis = {
      toneAnalysis: "Tono neutral detectado",
      strengths: ["Mensaje claro", "Buena estructura", "Vocabulario apropiado"],
      improvements: ["Reducir muletillas", "Agregar más llamadas a la acción", "Variar el ritmo"],
      closingScore: 50,
      feedback: "Buen intento, sigue practicando para mejorar tu capacidad de cierre."
    };

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "Eres un coach de ventas experto. Responde solo en JSON válido." },
              { role: "user", content: aiPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            aiAnalysis = {
              toneAnalysis: parsed.toneAnalysis || aiAnalysis.toneAnalysis,
              strengths: parsed.strengths || aiAnalysis.strengths,
              improvements: parsed.improvements || aiAnalysis.improvements,
              closingScore: Math.min(100, Math.max(0, parsed.closingScore || 50)),
              feedback: parsed.feedback || aiAnalysis.feedback
            };
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        // Continue with local analysis
      }
    }

    // Save to database
    const { data: scan, error: insertError } = await supabase
      .from("neuro_scans")
      .insert({
        user_id: userId,
        title: title || "Mi práctica de ventas",
        transcript,
        duration_seconds: durationSeconds,
        words_per_minute: wordsPerMinute,
        filler_words_count: fillerCount,
        filler_words_detected: fillerWordsDetected,
        persuasive_keywords_count: persuasiveCount,
        persuasive_keywords_detected: persuasiveDetected,
        tone_analysis: aiAnalysis.toneAnalysis,
        strengths: aiAnalysis.strengths,
        improvements: aiAnalysis.improvements,
        closing_score: aiAnalysis.closingScore,
        ai_feedback: aiAnalysis.feedback
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save scan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, scan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Neuro scanner error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
