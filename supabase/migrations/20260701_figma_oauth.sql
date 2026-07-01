-- Figma OAuth connections — per-user access/refresh tokens for reading Figma
-- files during brand analysis. Run once in the Supabase SQL editor. Idempotent.

create table if not exists public.figma_connections (
  user_id uuid primary key references public.users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,          -- when access_token expires (from expires_in)
  figma_user_id text,              -- Figma's own user id, for reference
  figma_handle text,               -- Figma display name / handle
  scope text,                      -- granted scope
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.figma_connections enable row level security;
-- Service role bypasses RLS; the app reads/writes tokens with the service key only.
-- Tokens are never exposed to the browser.
