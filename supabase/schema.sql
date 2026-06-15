-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  stripe_customer_id text,
  has_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Verification codes for passwordless login
create table if not exists public.verification_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists verification_codes_email_idx on public.verification_codes (email);

-- Wizard submissions (auto-saved per step)
create table if not exists public.wizard_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'Untitled Funnel',
  step_data jsonb not null default '{}',
  current_step integer not null default 1,
  status text not null default 'draft', -- draft | generating | complete
  generation_mode text not null default 'ai_copy', -- ai_copy | copy_doc
  active_copy_document_id uuid, -- fk copy_documents(id); see migrations/20260615_copy_doc_engine.sql
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration: run once if the table already exists without the name column
-- alter table public.wizard_submissions add column if not exists name text not null default 'Untitled Funnel';
create index if not exists wizard_submissions_user_idx on public.wizard_submissions (user_id);

-- Generated funnels
create table if not exists public.generated_funnels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  submission_id uuid references public.wizard_submissions(id),
  content jsonb not null default '{}',
  theme_slug text,
  generation_mode text not null default 'ai_copy', -- ai_copy | copy_doc
  source_document_id uuid, -- fk copy_documents(id); see migrations/20260615_copy_doc_engine.sql
  copy_doc_version int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hosting_status text not null default 'none', -- none | requested | approved | hosted
  approved_at timestamptz,
  hosted_url text
);
create index if not exists generated_funnels_user_idx on public.generated_funnels (user_id);

-- Uploaded copy documents (parsed into a CopyDoc IR). See copy-doc engine migration.
create table if not exists public.copy_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  submission_id uuid references public.wizard_submissions(id) on delete set null,
  storage_path text not null,
  file_name text,
  page_key text not null default 'eventLanding',
  parsed_json jsonb,
  parse_status text not null default 'pending', -- pending | parsed | failed
  parse_report jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists copy_documents_user_idx on public.copy_documents (user_id);

-- Migration: run once if the table already exists without new columns
-- alter table public.generated_funnels add column if not exists updated_at timestamptz not null default now();
-- alter table public.generated_funnels add column if not exists hosting_status text not null default 'none';
-- alter table public.generated_funnels add column if not exists approved_at timestamptz;
-- alter table public.generated_funnels add column if not exists hosted_url text;

-- RLS policies
alter table public.users enable row level security;
alter table public.verification_codes enable row level security;
alter table public.wizard_submissions enable row level security;
alter table public.generated_funnels enable row level security;
alter table public.copy_documents enable row level security;

-- Service role bypasses RLS; app uses service role key for all mutations

-- Storage buckets (run once; idempotent via Supabase dashboard or migration)
-- insert into storage.buckets (id, name, public)
--   values ('wizard-uploads', 'wizard-uploads', true)
--   on conflict (id) do nothing;
--
-- insert into storage.buckets (id, name, public)
--   values ('figma-files', 'figma-files', false)
--   on conflict (id) do nothing;
