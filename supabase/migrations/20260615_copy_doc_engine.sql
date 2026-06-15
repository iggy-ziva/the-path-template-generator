-- Copy-Document Page & Layout Engine — foundations
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).

-- 1. Uploaded copy documents (parsed into a CopyDoc IR).
create table if not exists public.copy_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  submission_id uuid references public.wizard_submissions(id) on delete set null,
  storage_path text not null,
  file_name text,
  page_key text not null default 'eventLanding', -- eventLanding | programmeLanding
  parsed_json jsonb,                              -- CopyDoc IR
  parse_status text not null default 'pending',   -- pending | parsed | failed
  parse_report jsonb,                             -- coverage report (sections, warnings)
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists copy_documents_user_idx on public.copy_documents (user_id);
create index if not exists copy_documents_submission_idx on public.copy_documents (submission_id);

alter table public.copy_documents enable row level security;
-- Service role bypasses RLS; the app mutates copy_documents with the service key.

-- 2. Generation provenance on generated funnels.
alter table public.generated_funnels
  add column if not exists generation_mode text not null default 'ai_copy'; -- ai_copy | copy_doc
alter table public.generated_funnels
  add column if not exists source_document_id uuid references public.copy_documents(id) on delete set null;
alter table public.generated_funnels
  add column if not exists copy_doc_version int;

-- 3. Wizard submission generation mode + active document pointer.
alter table public.wizard_submissions
  add column if not exists generation_mode text not null default 'ai_copy';
alter table public.wizard_submissions
  add column if not exists active_copy_document_id uuid references public.copy_documents(id) on delete set null;

-- 4. Private storage bucket for copy documents (copy is client IP).
insert into storage.buckets (id, name, public)
  values ('copy-docs', 'copy-docs', false)
  on conflict (id) do nothing;
