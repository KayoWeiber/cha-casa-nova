-- Allow delete of purchases but restrict via trigger to 5 minutes after reservation

-- Grants
grant delete on table public.purchases to anon, authenticated;

-- RLS policy to allow delete for public (trigger will enforce time window)
drop policy if exists "Allow delete purchases" on public.purchases;
create policy "Allow delete purchases"
on public.purchases
as permissive
for delete
to public
using (true);

-- Function: prevent delete after 5 minutes
create or replace function public.prevent_delete_after_five_minutes()
returns trigger
language plpgsql
security definer
as $$
begin
  if now() - old.purchased_at > interval '5 minutes' then
    raise exception 'Cancelamento permitido apenas até 5 minutos após reservar.';
  end if;
  return old;
end;
$$;

-- Trigger binding
drop trigger if exists prevent_late_delete_on_purchases on public.purchases;
create trigger prevent_late_delete_on_purchases
before delete on public.purchases
for each row
execute function public.prevent_delete_after_five_minutes();
