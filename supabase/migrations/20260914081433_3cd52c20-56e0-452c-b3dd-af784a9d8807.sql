CREATE TYPE public.identity_verification_status AS ENUM ('not_started', 'pending', 'verified', 'failed');

CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  resident_address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  identity_status public.identity_verification_status NOT NULL DEFAULT 'not_started',
  identity_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND identity_status = 'not_started' AND identity_verified_at IS NULL);
CREATE POLICY "Users can update unverified profile details" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND identity_status IN ('not_started', 'pending'));

CREATE TABLE public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'veriff' CHECK (provider = 'veriff'),
  provider_session_id TEXT UNIQUE,
  document_type TEXT,
  requires_document_back BOOLEAN NOT NULL DEFAULT true,
  status public.identity_verification_status NOT NULL DEFAULT 'not_started',
  failure_reason TEXT,
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.identity_verifications TO authenticated;
GRANT ALL ON public.identity_verifications TO service_role;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own identity checks" ON public.identity_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can start their own identity checks" ON public.identity_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status IN ('not_started', 'pending'));
CREATE POLICY "Users can update unfinished identity checks" ON public.identity_verifications FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status IN ('not_started', 'failed')) WITH CHECK (auth.uid() = user_id AND status IN ('not_started', 'pending'));

CREATE TABLE public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_key TEXT NOT NULL,
  device_name TEXT NOT NULL,
  browser_name TEXT,
  location_hint TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_current BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devices TO authenticated;
GRANT ALL ON public.user_devices TO service_role;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own devices" ON public.user_devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can register their own devices" ON public.user_devices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own devices" ON public.user_devices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own devices" ON public.user_devices FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_identity_verifications_updated_at BEFORE UPDATE ON public.identity_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_user_devices_updated_at BEFORE UPDATE ON public.user_devices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX identity_verifications_user_id_idx ON public.identity_verifications(user_id);
CREATE INDEX user_devices_user_id_idx ON public.user_devices(user_id);