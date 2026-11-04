import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { supabaseUrl as url, supabaseAnonKey as key } from '@/lib/config'

let client: SupabaseClient<Database> | undefined

export function getSupabase() {
  if (!url || !key) throw new Error('La conexión todavía no está configurada.')
  client ??= createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Patient attempt links also use URL fragments. Only process Auth redirects here.
      detectSessionInUrl: () => window.location.pathname === '/recuperar/actualizar',
      flowType: 'implicit',
    },
  })
  return client
}
