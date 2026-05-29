-- Post-generation editor + hosting ops columns
-- Run once in Supabase SQL editor if not already applied.

alter table public.generated_funnels add column if not exists updated_at timestamptz not null default now();
alter table public.generated_funnels add column if not exists hosting_status text not null default 'none';
alter table public.generated_funnels add column if not exists approved_at timestamptz;
alter table public.generated_funnels add column if not exists hosted_url text;
