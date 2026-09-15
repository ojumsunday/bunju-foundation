CREATE TYPE public.onboarding_role AS ENUM ('freelancer','founder','company','investor');

CREATE TABLE public.onboarding_interviews (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.onboarding_role,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  current_step smallint NOT NULL DEFAULT 1,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_interviews TO authenticated;
GRANT ALL ON public.onboarding_interviews TO service_role;
ALTER TABLE public.onboarding_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interview" ON public.onboarding_interviews FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.onboarding_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.onboarding_role NOT NULL,
  field_key text NOT NULL,
  question text,
  answer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, field_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_answers TO authenticated;
GRANT ALL ON public.onboarding_answers TO service_role;
ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own answers" ON public.onboarding_answers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER onboarding_interviews_updated_at BEFORE UPDATE ON public.onboarding_interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER onboarding_answers_updated_at BEFORE UPDATE ON public.onboarding_answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();