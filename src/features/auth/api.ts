import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export function subscribeToAuth(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const { data } = getSupabase().auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

export async function signIn(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}

export async function requestPasswordReset(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/recuperar/actualizar`,
  })
  if (error) throw error
}

export async function updatePassword(password: string) {
  const { error } = await getSupabase().auth.updateUser({ password })
  if (error) throw error
}
