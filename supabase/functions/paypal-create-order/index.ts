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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Get request body
    const { programId } = await req.json();

    if (!programId) {
      return new Response(
        JSON.stringify({ error: "Program ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch program details
    const { data: program, error: programError } = await supabase
      .from("programs")
      .select("*")
      .eq("id", programId)
      .single();

    if (programError || !program) {
      return new Response(
        JSON.stringify({ error: "Program not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PayPal access token
    const PAYPAL_API = "https://api-m.paypal.com"; // Use sandbox for testing: https://api-m.sandbox.paypal.com

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

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: programId,
            description: program.title,
            amount: {
              currency_code: program.currency || "USD",
              value: program.price.toString(),
            },
          },
        ],
        application_context: {
          brand_name: "Protocolo Hack",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${req.headers.get("origin")}/payment/success`,
          cancel_url: `${req.headers.get("origin")}/payment/cancel`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.id) {
      console.error("PayPal order creation failed:", orderData);
      throw new Error("Failed to create PayPal order");
    }

    // Store payment record in database
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      program_id: programId,
      paypal_order_id: orderData.id,
      amount: program.price,
      currency: program.currency || "USD",
      status: "pending",
      payment_data: orderData,
    });

    if (paymentError) {
      console.error("Error storing payment:", paymentError);
    }

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        approvalUrl: orderData.links.find((l: any) => l.rel === "approve")?.href,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating PayPal order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
