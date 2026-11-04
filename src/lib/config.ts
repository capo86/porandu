export const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isDemo = !isConfigured
