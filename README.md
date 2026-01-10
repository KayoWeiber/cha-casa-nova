# cha-casa-nova

This project now uses Supabase (Postgres + API) directly — no custom backend server. The frontend persists and reads data via `@supabase/supabase-js`.

## Setup
- Create a Supabase project and note the Project URL and anon/public key.
- Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Ensure `.env` stays git-ignored.

## Database & Migrations
- The schema is defined in `supabase/migrations/20260110_init.sql`.
- Apply migrations with Supabase CLI:

```
npm run supabase:push
```

Tables:
- `gifts`: gift catalog (read-only to public).
- `purchases`: gift reservations (public can insert/read; one row per `gift_id`).
- `rsvps`: presence confirmations (public can insert; no public read).

RLS is enabled with minimal policies:
- Public read on `gifts`.
- Public select + insert on `purchases`.
- Public insert on `rsvps`.

## Frontend
- Supabase client: `src/lib/supabaseClient.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Data access is via repositories in `src/repositories/`.
	- `giftsRepository.ts`: read gifts.
	- `purchasesRepository.ts`: read/mark purchased.
	- `rsvpRepository.ts`: submit RSVP.

LocalStorage/IndexedDB are no longer sources of truth (kept only for non-critical caching like images or UI preferences). Gift catalog and purchased status now come from the database.

## Local Data Migration
For initial population of `gifts` from the existing local arrays, use:

```
copy .env.example .env.local
# set SUPABASE_SERVICE_ROLE_KEY in .env.local (do NOT expose this key to the frontend)
npm run migrate:local
```

The script `scripts/migrate-local-to-supabase.ts`:
- Upserts gifts by `id` to avoid duplication.
- Logs counts before/after.
- Skips purchases/RSVPs (no local source).

## Scripts
- `supabase:start`: optional local Supabase.
- `supabase:push` / `db:migrate`: apply migrations.
- `migrate:local`: migrate local arrays to DB (service role key required locally).

## Notes
- No custom server is used; all data operations are via Supabase.
- Keep service role keys only in local env files, never in client code.

