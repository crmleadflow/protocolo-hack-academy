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
- Stripe (internacional) + Wompi (Colombia, en COP) + Whop (checkout
  hospedado, alternativa) para pagos. Cada oferta muestra Stripe o Wompi
  según su `currency` (USD → Stripe, COP → Wompi), y Whop siempre como
  segunda opción.
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
- `lib/payments/stripe.ts` / `lib/payments/wompi.ts` / `lib/payments/whop.ts` — pasarelas.
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
`main`, desplegado en Render (servicio `protocolo-hack-academy`, plan free)
desde https://github.com/crmleadflow/protocolo-hack-academy (repo público —
tuvo que serlo porque Render no tenía permiso para ver repos privados de esa
cuenta de GitHub; no hay nada sensible en el código, los secretos están solo
en las variables de entorno de Render). Dominio temporal:
https://protocolo-hack-academy.onrender.com — más adelante Hector apunta
`academy.leadflowneurosophia.io`. Nada de Vercel/DNS reales sin que Hector
lo pida explícitamente.

El plan free "se duerme" sin tráfico: la primera visita después de un rato
puede tardar ~50 segundos en responder.

Mongo Atlas solo deja conectarse desde IPs en su lista blanca. Están
agregadas las dos de Render (región Virginia): `74.220.49.0/24` y
`74.220.57.0/24` — no se usó 0.0.0.0/0 a propósito, para no abrir la base a
cualquier IP del mundo.

## Cosas que NO se tocan
- `~/lead-flow-crm` — solo lectura, nunca escritura, desde este repo.
- `lib/crm/bridge.ts` no debe empezar a mandar `phone` al webhook sin que
  Hector lo autorice (dispara WhatsApp automático del lado del CRM).

## Pendientes (lo que falta para pasar de MVP a completo)
1. **Variables reales**: `MONGODB_URI` (✅), `AUTH_SECRET` (✅),
   `AUTH_RESEND_KEY` + `EMAIL_FROM` (✅), `SUPER_ADMIN_EMAILS` (✅),
   `WHOP_API_KEY` (✅, probada con un pago de prueba real — ver abajo).
   Pausados a propósito, decisión de Hector (30/10/2026): `STRIPE_SECRET_KEY`
   + `STRIPE_WEBHOOK_SECRET` (activar Stripe real más adelante) y
   `WOMPI_PUBLIC_KEY` + `WOMPI_PRIVATE_KEY` + `WOMPI_INTEGRITY_SECRET` +
   `WOMPI_EVENTS_SECRET` — la cuenta de Wompi que ya tiene es la misma del
   CRM, con un solo aviso de pagos (webhook) para toda la cuenta: usarla acá
   también apagaría el aviso que recibe el CRM. Hasta que haya una cuenta de
   Wompi separada para Protocolo Hack, Whop es la única forma de pago
   funcionando de verdad.
2. **Token del puente al CRM**: Hector tiene que loguearse en su tenant del
   CRM y crear una integración "landing externa" llamada "Protocolo Hack" para
   generar `LEADFLOW_CRM_WEBHOOK_TOKEN`. Hasta entonces, toda intención de
   compra queda pendiente en `crm_outbox` (no se pierde, se reintenta desde
   `/admin/crm`).
3. **Whop**: probado con un pago de prueba real (`POST
   /checkout_configurations` devolvió 200 con una URL de pago válida).
   Falta todavía un pago de PUNTA A PUNTA (pagar de verdad y ver que el
   webhook inscriba al comprador) para confirmar que el correo del
   comprador llega bien en `payment.succeeded`.
4. **Mentorías**: ✅ ya tiene calendario propio (`/admin/mentorias` para
   cargar horarios, `/mentorias` para reservarlos). La compra (marketplace)
   y la reserva del horario son dos pasos separados — no se exige haber
   comprado para reservar, a propósito, para no sobre-diseñar esta primera
   etapa.
5. **Planes de Lead Flow CRM y plugins**: se muestran en el marketplace como
   catálogo, pero no hay checkout — el botón manda la intención al CRM para
   que Hector cierre la venta a mano (no hay alta automática de cuenta en el
   CRM desde aquí, ni falta que la haya).
6. **Probado en producción real**: la home, marketplace, login y recursos
   responden bien en https://protocolo-hack-academy.onrender.com (lectura y
   escritura contra la base real confirmadas). Falta todavía: completar un
   login con enlace mágico de punta a punta (pedirlo y hacer click en el
   correo) y una compra real con Whop.
7. **Deploy en Render**: ✅ listo (ver "Rama de producción" arriba).

## Nota aparte: Whop también se agregó al CRM

Además de acá, Whop se agregó por separado al Payment Hub de
`~/lead-flow-crm`, en una rama de ESE repo (`feature/whop-payment-gateway`,
ya subida a GitHub, sin PR ni merge todavía). Son dos integraciones de Whop
independientes — no comparten código ni credenciales — porque Hector decidió
mantener Protocolo Hack y el CRM con cobros separados (ver conversación del
30/10/2026: "cuál preferís" → "a", separado).
