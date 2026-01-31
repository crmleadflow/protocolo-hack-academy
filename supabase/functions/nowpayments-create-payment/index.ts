import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  programId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOWPAYMENTS_API_KEY = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPAYMENTS_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { programId }: PaymentRequest = await req.json();

    if (!programId) {
      return new Response(
        JSON.stringify({ error: "programId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get program details
    const { data: program, error: programError } = await supabaseAdmin
      .from("programs")
      .select("id, title, price, currency")
      .eq("id", programId)
      .single();

    if (programError || !program) {
      return new Response(
        JSON.stringify({ error: "Program not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already has active enrollment
    const { data: existingEnrollment } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("program_id", programId)
      .eq("status", "active")
      .single();

    if (existingEnrollment) {
      return new Response(
        JSON.stringify({ error: "User already enrolled in this program" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the origin for callback URLs
    const origin = req.headers.get("origin") || "https://protocol-buddy-connect.lovable.app";

    // Create payment in NOWPayments
    const nowPaymentsResponse = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: program.price,
        price_currency: program.currency.toLowerCase(),
        pay_currency: "usdttrc20", // USDT on TRON network
        order_id: `${programId}_${user.id}_${Date.now()}`,
        order_description: `Programa: ${program.title}`,
        ipn_callback_url: `${SUPABASE_URL}/functions/v1/nowpayments-webhook`,
        success_url: `${origin}/payment-success?programId=${programId}&method=crypto`,
        cancel_url: `${origin}/payment-cancel?programId=${programId}`,
      }),
    });

    if (!nowPaymentsResponse.ok) {
      const errorData = await nowPaymentsResponse.text();
      console.error("NOWPayments API error:", errorData);
      throw new Error(`NOWPayments API error: ${nowPaymentsResponse.status}`);
    }

    const paymentData = await nowPaymentsResponse.json();

    // Create pending payment record
    const { error: paymentDbError } = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      program_id: programId,
      amount: program.price,
      currency: program.currency,
      status: "pending",
      payment_data: {
        provider: "nowpayments",
        payment_id: paymentData.payment_id,
        pay_address: paymentData.pay_address,
        pay_amount: paymentData.pay_amount,
        pay_currency: paymentData.pay_currency,
      },
    });

    if (paymentDbError) {
      console.error("Error saving payment:", paymentDbError);
    }

    return new Response(
      JSON.stringify({
        paymentId: paymentData.payment_id,
        payAddress: paymentData.pay_address,
        payAmount: paymentData.pay_amount,
        payCurrency: paymentData.pay_currency,
        paymentStatus: paymentData.payment_status,
        expirationEstimateDate: paymentData.expiration_estimate_date,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating crypto payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
