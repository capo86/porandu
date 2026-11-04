import { PGlite } from '@electric-sql/pglite'
import { readdir, readFile } from 'node:fs/promises'

export async function createTestDatabase() {
  const db = new PGlite()
  // Supabase creates these roles and auth.users; reproduce only their contract for SQL tests.
  await db.exec('create role anon; create role authenticated; create schema auth; create table auth.users (id uuid primary key);')
  const migrations = (await readdir('supabase/migrations')).filter((name) => name.endsWith('.sql')).sort()
  for (const name of migrations) await db.exec(await readFile(`supabase/migrations/${name}`, 'utf8'))
  return db
}
