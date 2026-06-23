create extension if not exists citext;
create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  consent_given boolean not null default false,
  consent_text text not null,
  source_page text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Allow public newsletter signups" on public.newsletter_subscribers;

create policy "Allow public newsletter signups"
on public.newsletter_subscribers
for insert
to anon
with check (
  email is not null
  and consent_given = true
  and consent_text = 'I agree to receive occasional emails from Favour Osofisan (no spam, unsubscribe anytime).'
);
