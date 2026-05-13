create extension if not exists pgcrypto;

create table if not exists public.mahjong_scores (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  username text not null,
  city text not null,
  challenge_date date not null,
  mode text not null check (mode in ('calm', 'daily', 'sprint')),
  score integer not null default 0,
  time_seconds integer not null default 0,
  used_hints integer not null default 0,
  used_ai integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists mahjong_scores_challenge_date_idx
  on public.mahjong_scores (challenge_date desc);

create index if not exists mahjong_scores_city_idx
  on public.mahjong_scores (city);

create index if not exists mahjong_scores_score_idx
  on public.mahjong_scores (score desc, time_seconds asc);

alter table public.mahjong_scores enable row level security;

drop policy if exists "mahjong_scores_select_public" on public.mahjong_scores;
create policy "mahjong_scores_select_public"
on public.mahjong_scores
for select
to anon, authenticated
using (true);

drop policy if exists "mahjong_scores_insert_public" on public.mahjong_scores;
create policy "mahjong_scores_insert_public"
on public.mahjong_scores
for insert
to anon, authenticated
with check (
  length(coalesce(username, '')) > 0
  and length(coalesce(city, '')) > 0
  and score >= 0
  and time_seconds >= 0
  and used_hints >= 0
  and used_ai >= 0
);
