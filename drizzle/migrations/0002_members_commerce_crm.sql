CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR (_role = 'admin' AND role = 'super_admin'))
  )
$$;

-- Nobody writes roles from the browser: only server code (service role) changes them
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;

CREATE TABLE public.account_status (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  reason text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_status TO authenticated;
GRANT ALL ON public.account_status TO service_role;
ALTER TABLE public.account_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own status" ON public.account_status FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Commerce
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','refunded')),
  provider text NOT NULL DEFAULT 'stripe',
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  checkout_session_id text UNIQUE,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_type text NOT NULL CHECK (product_type IN ('program','tool')),
  product_id uuid NOT NULL,
  title text NOT NULL,
  unit_amount numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('program','tool')),
  product_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_type, product_id)
);
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own entitlements" ON public.entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'paypal';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_reference text;
ALTER TABLE public.payments ALTER COLUMN program_id DROP NOT NULL;

-- CRM
CREATE TABLE public.intent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  request_id uuid,
  user_id uuid,
  page_url text,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.intent_events TO authenticated;
GRANT ALL ON public.intent_events TO service_role;
ALTER TABLE public.intent_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read intents" ON public.intent_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.crm_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_event_id uuid REFERENCES public.intent_events(id) ON DELETE SET NULL,
  destination text NOT NULL DEFAULT 'leadflow',
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.crm_outbox TO authenticated;
GRANT ALL ON public.crm_outbox TO service_role;
ALTER TABLE public.crm_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read outbox" ON public.crm_outbox FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
-- Guarantee: phone never leaves via the outbox
ALTER TABLE public.crm_outbox ADD CONSTRAINT crm_outbox_no_phone CHECK (NOT (payload ? 'phone'));