import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Create enrollment for the main program
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

    // If this is the "Arsenal Maestro: Hack 6" package, also enroll in all 6 individual programs
    if (payment.program_id === ARSENAL_MAESTRO_HACK6_ID) {
      console.log("Enrolling user in all 6 included programs...");
      
      const enrollmentPromises = INCLUDED_PROGRAM_IDS.map(async (programId) => {
        const { error } = await supabase.from("enrollments").upsert(
          {
            user_id: userId,
            program_id: programId,
            payment_id: payment.id,
            status: "active",
            enrolled_at: new Date().toISOString(),
            is_manual: false,
          },
          { onConflict: "user_id,program_id" }
        );
        
        if (error) {
          console.error(`Error enrolling in program ${programId}:`, error);
        } else {
          console.log(`Successfully enrolled in program ${programId}`);
        }
      });

      await Promise.all(enrollmentPromises);
      console.log("All 6 program enrollments completed");
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
