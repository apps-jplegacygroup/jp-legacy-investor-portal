import { Pool } from 'pg'

let pool: Pool | null = null
let migrationDone = false

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

async function runMigrations(p: Pool) {
  if (migrationDone) return
  try {
    await p.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_urls TEXT[]')
    await p.query("ALTER TABLE properties ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'available'")
    await p.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS closing_costs_percent NUMERIC NOT NULL DEFAULT 4')
    migrationDone = true
  } catch {
    migrationDone = true
  }
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getPool()
  await runMigrations(client)
  const result = await client.query(text, params)
  return result.rows as T[]
}

export const sql = query
