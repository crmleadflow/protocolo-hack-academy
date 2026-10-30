import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// `stripe` queda en null si todavía no hay clave configurada — las rutas que
// lo usan lo chequean y responden con un error claro en vez de reventar.
export const stripe = key ? new Stripe(key) : null;
