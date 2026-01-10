/**
 * Local data → Supabase migration script.
 *
 * Requirements:
 * - Create a local .env or .env.local (git-ignored) with:
 *   - (preferred) DATABASE_URL
 *   - OR SUPABASE_URL (or VITE_SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 * - Do NOT expose the service role key to the frontend.
 * - Run with: npm run migrate:local
 */

import dotenv from 'dotenv'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { presentes } from '../src/data/presentes'

// Load env files (Node does NOT auto-load .env/.env.local)
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL

// Prefer direct Postgres connection if DATABASE_URL exists (fast + reliable for bulk upsert)
let admin: SupabaseClient | null = null
let pool: Pool | null = null

if (DATABASE_URL && DATABASE_URL.trim()) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  console.log('Using direct Postgres connection (DATABASE_URL) for migration')
} else {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      'Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in environment, and no DATABASE_URL provided.'
    )
    process.exit(1)
  }

  admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  console.log('Using Supabase HTTP client (service role) for migration')
}

type GiftRow = {
  id: number
  nome: string
  image_url: string
  link_loja: string
  comodo: string // will be cast to ::room in SQL path
  remove_bg: boolean | null
  bg_tolerance: number | null
  bg_sample: 'corners' | 'border' | null
}

function mapPresentesToGiftRows(): GiftRow[] {
  return presentes.map((p) => ({
    id: p.id,
    nome: p.nome,
    image_url: p.imageUrl || '',
    link_loja: p.linkLoja || '',
    comodo: p.comodo,
    remove_bg: p.removeBg ?? null,
    bg_tolerance: p.bgTolerance ?? null,
    bg_sample: p.bgSample ?? null,
  }))
}

async function upsertGifts(): Promise<number> {
  const rows = mapPresentesToGiftRows()

  if (rows.length === 0) return 0

  if (pool) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      let affected = 0
      for (const r of rows) {
        const { rowCount } = await client.query(
          `insert into public.gifts (id, nome, image_url, link_loja, comodo, remove_bg, bg_tolerance, bg_sample)
           values ($1, $2, $3, $4, $5::room, $6, $7, $8)
           on conflict (id) do update set
             nome = excluded.nome,
             image_url = excluded.image_url,
             link_loja = excluded.link_loja,
             comodo = excluded.comodo,
             remove_bg = excluded.remove_bg,
             bg_tolerance = excluded.bg_tolerance,
             bg_sample = excluded.bg_sample`,
          [r.id, r.nome, r.image_url, r.link_loja, r.comodo, r.remove_bg, r.bg_tolerance, r.bg_sample]
        )

        // rowCount in upsert can be 1 for insert OR update depending on driver behavior
        affected += rowCount ?? 0
      }

      await client.query('COMMIT')
      return affected
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }

  if (admin) {
    const { data, error } = await admin.from('gifts').upsert(rows, { onConflict: 'id' })
    if (error) throw error
    return data?.length ?? 0
  }

  throw new Error('No migration client available')
}

async function countGifts(): Promise<number> {
  if (pool) {
    const res = await pool.query('select count(*)::int as c from public.gifts')
    return res.rows[0]?.c ?? 0
  }

  if (admin) {
    const { count, error } = await admin.from('gifts').select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  }

  return 0
}

async function main() {
  try {
    const beforeCount = await countGifts()
    const insertedOrUpdated = await upsertGifts()
    const afterCount = await countGifts()

    console.log('Migration summary:')
    console.log(`- Gifts before: ${beforeCount}`)
    console.log(`- Gifts inserted/updated: ${insertedOrUpdated}`)
    console.log(`- Gifts after: ${afterCount}`)
    console.log('- Purchases/RSVPs: no local source; skipped')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exitCode = 1
  } finally {
    if (pool) {
      await pool.end().catch(() => {})
    }
  }
}

main()
