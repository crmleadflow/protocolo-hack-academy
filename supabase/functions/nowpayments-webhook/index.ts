import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ID del paquete "Arsenal Maestro: Hack 6"
const ARSENAL_MAESTRO_HACK6_ID = "c5496a23-6acd-43f9-bb63-affd19992c3f";

// IDs de los 6 programas individuales incluidos en el paquete
const INCLUDED_PROGRAM_IDS = [
  "12ab251e-a501-4832-aa29-4edb8cef4840", // Protocolo Hack
  "a1d8e2d4-0f9c-46b7-90d0-2aeede6a3998", // Neuro Talk
  "b0742b04-29d1-448d-9150-2bd19069d6e9", // IA Business Lab
  "9d46f2a1-01bd-484b-9e2c-b604af2aa984", // Product Creator Pro
  "eaafca45-228f-442b-9a43-7f939d09623d", // Fast Brand Accelerator
  "33aeb06d-6c44-481c-8fa7-24c3fb8debbe", // Video Magnet
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse webhook payload
    const payload = await req.json();
    console.log("NOWPayments webhook received:", JSON.stringify(payload));

    const {
      payment_id,
      payment_status,
      order_id,
      actually_paid,
      pay_amount,
    } = payload;

    // Extract user and program info from order_id
    // Format: programId_userId_timestamp
    const orderParts = order_id?.split("_") || [];
    const programId = orderParts[0];
    const userId = orderParts[1];

    if (!programId || !userId) {
      console.error("Invalid order_id format:", order_id);
      return new Response(JSON.stringify({ error: "Invalid order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the pending payment
    const { data: existingPayment, error: findError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("program_id", programId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (findError || !existingPayment) {
      console.error("Payment not found:", findError);
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map NOWPayments status to our status
    let newStatus: "pending" | "completed" | "failed" = "pending";
    if (payment_status === "finished" || payment_status === "confirmed") {
      newStatus = "completed";
    } else if (payment_status === "failed" || payment_status === "expired" || payment_status === "refunded") {
      newStatus = "failed";
    }

    // Update payment record
    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: newStatus,
        payment_data: {
          ...existingPayment.payment_data,
          payment_status,
          actually_paid,
          pay_amount,
          webhook_received_at: new Date().toISOString(),
        },
      })
      .eq("id", existingPayment.id);

    if (updateError) {
      console.error("Error updating payment:", updateError);
    }

    // If payment completed, create enrollments
    if (newStatus === "completed") {
      // Check if main enrollment already exists
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("program_id", programId)
        .single();

      if (!existingEnrollment) {
        // Create main enrollment
        const { error: enrollmentError } = await supabaseAdmin
          .from("enrollments")
          .insert({
            user_id: userId,
            program_id: programId,
            status: "active",
            payment_id: existingPayment.id,
            enrolled_at: new Date().toISOString(),
          });

        if (enrollmentError) {
          console.error("Error creating enrollment:", enrollmentError);
        } else {
          console.log("Enrollment created for user:", userId, "program:", programId);
        }
      }

      // If this is the "Arsenal Maestro: Hack 6" package, also enroll in all 6 individual programs
      if (programId === ARSENAL_MAESTRO_HACK6_ID) {
        console.log("Enrolling user in all 6 included programs...");
        
        const enrollmentPromises = INCLUDED_PROGRAM_IDS.map(async (includedProgramId) => {
          // Check if already enrolled
          const { data: existing } = await supabaseAdmin
            .from("enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("program_id", includedProgramId)
            .single();

          if (!existing) {
            const { error } = await supabaseAdmin
              .from("enrollments")
              .insert({
                user_id: userId,
                program_id: includedProgramId,
                status: "active",
                payment_id: existingPayment.id,
                enrolled_at: new Date().toISOString(),
              });
            
            if (error) {
              console.error(`Error enrolling in program ${includedProgramId}:`, error);
            } else {
              console.log(`Successfully enrolled in program ${includedProgramId}`);
            }
          } else {
            console.log(`User already enrolled in program ${includedProgramId}`);
          }
        });

        await Promise.all(enrollmentPromises);
        console.log("All 6 program enrollments completed");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
