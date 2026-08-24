CREATE TABLE public.job_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  title TEXT NOT NULL DEFAULT 'Untitled role',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_descriptions TO authenticated;
GRANT ALL ON public.job_descriptions TO service_role;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own job descriptions" ON public.job_descriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  job_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT 'Unknown candidate',
  skills TEXT[] NOT NULL DEFAULT '{}',
  years_experience NUMERIC NOT NULL DEFAULT 0,
  education TEXT NOT NULL DEFAULT '',
  match_score INTEGER NOT NULL DEFAULT 0,
  justification TEXT NOT NULL DEFAULT '',
  resume_text TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidates TO authenticated;
GRANT ALL ON public.candidates TO service_role;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own candidates" ON public.candidates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX candidates_user_created_idx ON public.candidates (user_id, created_at DESC);