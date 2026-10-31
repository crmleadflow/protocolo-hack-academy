# CLAUDE.md — Protocolo Hack (academia + comunidad)

## Qué es
Comunidad y academia de marca propia de Hector. Repo y base de datos 100%
separados de `lead-flow-crm`. Gente entra gratis con recursos/cursos, y se le
vende cursos, mentorías, plugins, planes de Lead Flow CRM y charlas desde un
marketplace. Las intenciones de compra se mandan como leads al CRM
(`~/lead-flow-crm`) por un webhook que YA EXISTE ahí — cero cambios en ese repo.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (preset Nova,
  base Radix — no base-ui, por `asChild`).
- MongoDB Atlas, driver nativo (sin Mongoose). Base propia, nunca la del CRM.
- Auth.js (NextAuth v5) con magic link por Resend, sesiones en base de datos
  (cookie httpOnly, sin localStorage).
- Stripe (internacional) + Wompi (Colombia, en COP) para pagos. Cada oferta
  elige su pasarela por su `currency` (USD → Stripe, COP → Wompi).
- Deploy pensado para Render (como el CRM), dominio temporal de Render por
  ahora.

## Carpetas clave
- `app/` — páginas (App Router). Rutas en español: `/academia`, `/marketplace`,
  `/recursos`, `/eventos`, `/comunidad`, `/mentorias`, `/admin/*`, `/cuenta`.
- `lib/db.ts` — acceso a Mongo, por colección (`Collections.members()`, etc.)
  y los índices (incluye el único de `crm_outbox.memberId`, clave de la
  idempotencia del puente al CRM).
- `lib/mongodb.ts` — cliente de Mongo cacheado (conexión diferida: si falta
  `MONGODB_URI` no rompe el build, solo falla cuando se usa de verdad).
- `lib/actions/*.ts` — server actions (mutaciones desde formularios): miembros,
  cursos, recursos, ofertas, eventos, foro, academia, leads públicos.
- `lib/crm/bridge.ts` — el puente hacia Lead Flow CRM: `intent_events` →
  `crm_outbox` (único por miembro) → `POST /api/webhooks/lead/[token]` del
  CRM. A propósito NUNCA manda `phone` (ver comentario en el archivo: ese
  endpoint dispara WhatsApp automático via Sophia, y eso está apagado hasta
  que Hector lo pida).
- `lib/payments/stripe.ts` / `lib/payments/wompi.ts` — pasarelas.
- `auth.ts` — configuración de Auth.js. El primer login de un correo nuevo
  crea el `member` activo de una (sin cola de aprobación). `SUPER_ADMIN_EMAILS`
  decide quién entra como admin desde el primer login.
- `types/models.ts` — forma de cada colección de Mongo.

## Comando para correr
```
npm run dev
```
Necesita `.env.local` con, como mínimo, `MONGODB_URI` y `AUTH_SECRET` para que
las páginas no tiren error 500 (están armadas para fallar solo en tiempo de
uso, no en el build, si falta una variable).

## Comando para verificar
```
npm run check
```
Corre `eslint` + `tsc --noEmit`. `npm run build` además compila todo (más
lento, usarlo antes de un deploy).

## Rama de producción
Todavía no hay deploy. Cuando lo haya: Render, servicio nuevo y separado del
CRM (que vive en la rama `plan-b-render` de ese otro repo). Nada de Vercel/DNS
reales sin que Hector lo pida explícitamente.

## Cosas que NO se tocan
- `~/lead-flow-crm` — solo lectura, nunca escritura, desde este repo.
- `lib/crm/bridge.ts` no debe empezar a mandar `phone` al webhook sin que
  Hector lo autorice (dispara WhatsApp automático del lado del CRM).

## Pendientes (lo que falta para pasar de MVP a completo)
1. **Variables reales**: `MONGODB_URI` (Atlas, base propia — ✅ ya cargada),
   `AUTH_SECRET` (✅), `AUTH_RESEND_KEY` + `EMAIL_FROM` (✅),
   `SUPER_ADMIN_EMAILS` (✅ el correo de Hector). Faltan:
   `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (Hector decidió activar
   Stripe real más adelante, dejarlo pausado por ahora), `WOMPI_PUBLIC_KEY` +
   `WOMPI_PRIVATE_KEY` + `WOMPI_INTEGRITY_SECRET` + `WOMPI_EVENTS_SECRET`.
2. **Token del puente al CRM**: Hector tiene que loguearse en su tenant del
   CRM y crear una integración "landing externa" llamada "Protocolo Hack" para
   generar `LEADFLOW_CRM_WEBHOOK_TOKEN`. Hasta entonces, toda intención de
   compra queda pendiente en `crm_outbox` (no se pierde, se reintenta desde
   `/admin/crm`).
3. **Wompi**: checkout (`/api/checkout/wompi`) y webhook
   (`/api/webhooks/wompi`) ya están armados, mismo patrón que Stripe. Falta
   probarlo con llaves reales de Wompi (no existen todavía).
4. **Mentorías**: se venden por el marketplace (Stripe), pero coordinar el
   horario con el mentor es manual (sin calendario propio todavía —
   `mentorship_programs/slots/bookings` del modelo sugerido no se llegaron a
   construir en esta primera etapa).
5. **Planes de Lead Flow CRM y plugins**: se muestran en el marketplace como
   catálogo, pero no hay checkout — el botón manda la intención al CRM para
   que Hector cierre la venta a mano (no hay alta automática de cuenta en el
   CRM desde aquí, ni falta que la haya).
6. **No probado con credenciales reales**: el build y el tipado pasan
   (`npm run check`, `npm run build`), y la home/el login renderizan sin base
   de datos. Pero el login con enlace mágico, los pagos y el envío real al
   CRM no se probaron de punta a punta — necesitan las variables del punto 1.
7. **Deploy en Render**: no se creó el servicio todavía. Falta que Hector lo
   autorice.

## Nota aparte: Whop en el CRM (no en este repo)

Hector pidió agregar Whop (whop.com) como método de pago, pero DENTRO del
Payment Hub de `~/lead-flow-crm` (no acá). Eso se hizo en una rama separada
de ESE repo: `feature/whop-payment-gateway` (ya subida a GitHub, sin PR ni
merge todavía). No toca nada de Protocolo Hack.
