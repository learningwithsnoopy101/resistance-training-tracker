-- 03_create_insights_table.sql
-- Phase 4 (Option A): cache table for LLM-generated insights.
-- Written by the weekly generator (service-role key, GitHub Actions cron);
-- read by the app via anon key + RLS like any other table.
-- Run in the Supabase SQL editor.

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('digest', 'muscle_insight')),
  content text not null,
  generated_at timestamptz not null default now()
);

alter table public.insights enable row level security;

-- Users can only read their own insights. No insert/update/delete policies:
-- only the service-role generator writes (it bypasses RLS).
create policy "Users read own insights"
  on public.insights for select
  using (auth.uid() = user_id);

create index if not exists insights_user_kind_time
  on public.insights (user_id, kind, generated_at desc);
