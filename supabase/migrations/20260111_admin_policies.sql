-- Admin policies: allow authenticated users to manage gifts and read RSVPs

-- Grants for gifts
grant insert, update, delete on table public.gifts to authenticated;

-- Policies for gifts
drop policy if exists "Admin insert gifts" on public.gifts;
create policy "Admin insert gifts"
on public.gifts
for insert
to authenticated
with check (true);

drop policy if exists "Admin update gifts" on public.gifts;
create policy "Admin update gifts"
on public.gifts
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admin delete gifts" on public.gifts;
create policy "Admin delete gifts"
on public.gifts
for delete
to authenticated
using (true);

-- RSVPs: allow authenticated to select (admin view)
grant select on table public.rsvps to authenticated;

drop policy if exists "Allow select rsvp for authenticated" on public.rsvps;
create policy "Allow select rsvp for authenticated"
on public.rsvps
for select
to authenticated
using (true);
