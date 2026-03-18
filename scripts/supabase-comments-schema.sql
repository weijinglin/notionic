-- Supabase schema for threaded comments used by components/Post/SupaComments.js
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  parent_id uuid null references public.comments(id) on delete cascade,
  nickname text not null,
  email text null,
  website text null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_content_len check (char_length(content) between 1 and 3000),
  constraint comments_nickname_len check (char_length(nickname) between 1 and 80)
);

create index if not exists comments_post_id_created_at_idx
  on public.comments (post_id, created_at asc);

create index if not exists comments_parent_id_idx
  on public.comments (parent_id);

create or replace function public.set_comments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_comments_updated_at();

alter table public.comments enable row level security;

drop policy if exists "Public can read comments" on public.comments;
drop policy if exists "Public can insert comments" on public.comments;
drop policy if exists "No anonymous update" on public.comments;
drop policy if exists "No anonymous delete" on public.comments;

-- Public read
create policy "Public can read comments"
on public.comments
for select
to anon, authenticated
using (true);

-- Public write (insert only)
create policy "Public can insert comments"
on public.comments
for insert
to anon, authenticated
with check (
  char_length(content) between 1 and 3000
  and char_length(nickname) between 1 and 80
  and (website is null or char_length(website) <= 255)
  and (email is null or char_length(email) <= 255)
  and (
    parent_id is null
    or exists (
      select 1
      from public.comments p
      where p.id = parent_id
        and p.post_id = post_id
    )
  )
);

-- Block anonymous update/delete
create policy "No anonymous update"
on public.comments
for update
to anon, authenticated
using (false)
with check (false);

create policy "No anonymous delete"
on public.comments
for delete
to anon, authenticated
using (false);
