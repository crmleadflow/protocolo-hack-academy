import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("PayPal credentials not configured");
    }

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Use service role for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get request body
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PayPal access token
    const PAYPAL_API = "https://api-m.paypal.com"; // Use sandbox for testing

    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();

    if (!authData.access_token) {
      throw new Error("Failed to get PayPal access token");
    }

    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.access_token}`,
      },
    });

    const captureData = await captureResponse.json();

    if (captureData.status !== "COMPLETED") {
      console.error("Payment capture failed:", captureData);
      
      // Update payment status to failed
      await supabase
        .from("payments")
        .update({ status: "failed", payment_data: captureData })
        .eq("paypal_order_id", orderId);

      return new Response(
        JSON.stringify({ error: "Payment capture failed", details: captureData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment status to completed
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        paypal_payer_id: captureData.payer?.payer_id,
        payment_data: captureData,
      })
      .eq("paypal_order_id", orderId)
      .select()
      .single();

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
      throw new Error("Failed to update payment record");
    }

    // Create enrollment
    const { error: enrollmentError } = await supabase.from("enrollments").upsert(
      {
        user_id: userId,
        program_id: payment.program_id,
        payment_id: payment.id,
        status: "active",
        enrolled_at: new Date().toISOString(),
        is_manual: false,
      },
      { onConflict: "user_id,program_id" }
    );

    if (enrollmentError) {
      console.error("Error creating enrollment:", enrollmentError);
      throw new Error("Failed to create enrollment");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment captured and enrollment created successfully",
        programId: payment.program_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error capturing PayPal order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
