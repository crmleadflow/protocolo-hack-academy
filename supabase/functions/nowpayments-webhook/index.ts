import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // If payment completed, create enrollment
    if (newStatus === "completed") {
      // Check if enrollment already exists
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("program_id", programId)
        .single();

      if (!existingEnrollment) {
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
