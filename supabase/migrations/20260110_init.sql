-- Enable required extensions
create extension if not exists pgcrypto;

-- Enum for rooms
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room') THEN
    CREATE TYPE room AS ENUM ('Cozinha','Banheiro','Sala','Quarto','Lavanderia','Outros');
  END IF;
END $$;

-- Gifts table
create table if not exists public.gifts (
  id integer primary key,
  nome text not null,
  image_url text not null default '',
  link_loja text not null default '',
  comodo room not null,
  remove_bg boolean,
  bg_tolerance integer,
  bg_sample text check (bg_sample in ('corners','border'))
);

create index if not exists gifts_comodo_idx on public.gifts (comodo);

-- Purchases (reservations)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  gift_id integer not null references public.gifts(id) on delete cascade,
  purchased_at timestamptz not null default now(),
  unique (gift_id)
);

-- RSVPs
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  attending boolean not null,
  date timestamptz not null
);

-- RLS
alter table public.gifts enable row level security;
alter table public.purchases enable row level security;
alter table public.rsvps enable row level security;

-- (Opcional, mas ajuda a garantir que SEMPRE vai aplicar RLS)
-- alter table public.gifts force row level security;
-- alter table public.purchases force row level security;
-- alter table public.rsvps force row level security;

-- Grants (necessário para o front usar via anon key)
grant usage on schema public to anon, authenticated;

grant select on table public.gifts to anon, authenticated;
grant select, insert on table public.purchases to anon, authenticated;
grant insert on table public.rsvps to anon, authenticated;

-- Policies
-- Gifts: public read-only
drop policy if exists "Public read gifts" on public.gifts;
create policy "Public read gifts"
on public.gifts
for select
using (true);

-- Purchases: public can read and insert to reserve
drop policy if exists "Public read purchases" on public.purchases;
create policy "Public read purchases"
on public.purchases
for select
using (true);

drop policy if exists "Allow insert purchases" on public.purchases;
create policy "Allow insert purchases"
on public.purchases
for insert
with check (true);

-- RSVPs: allow public insert only (no public select)
drop policy if exists "Allow insert rsvp" on public.rsvps;
create policy "Allow insert rsvp"
on public.rsvps
for insert
with check (true);
