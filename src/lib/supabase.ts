import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { supabaseUrl as url, supabaseAnonKey as key } from '@/lib/config'

let client: SupabaseClient<Database> | undefined

export function getSupabase() {
  if (!url || !key) throw new Error('La conexión todavía no está configurada.')
  client ??= createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return client
}
