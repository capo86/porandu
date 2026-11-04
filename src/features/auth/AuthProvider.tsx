import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from '@/features/auth/context'
import { isConfigured } from '@/lib/config'

const recoveryKey = 'porandu:password-recovery:v1'
function readRecovery() {
  try { return sessionStorage.getItem(recoveryKey) === 'active' } catch { return false }
}
function writeRecovery(active: boolean) {
  try { if (active) sessionStorage.setItem(recoveryKey, 'active'); else sessionStorage.removeItem(recoveryKey) } catch { /* Storage can be unavailable. */ }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isConfigured)
  const [recovery, setRecovery] = useState(readRecovery)

  useEffect(() => {
    if (!isConfigured) return
    let active = true
    let unsubscribe = () => {}
    void import('@/features/auth/api').then(({ subscribeToAuth }) => {
      if (!active) return
      unsubscribe = subscribeToAuth((event, nextSession) => {
        if (event === 'PASSWORD_RECOVERY') { writeRecovery(true); setRecovery(true) }
        if (event === 'SIGNED_OUT') { writeRecovery(false); setRecovery(false) }
        setSession(nextSession)
        setLoading(false)
      })
    }).catch(() => { if (active) setLoading(false) })
    return () => { active = false; unsubscribe() }
  }, [])

  function clearRecovery() { writeRecovery(false); setRecovery(false) }
  return <AuthContext.Provider value={{ session, loading, recovery, clearRecovery }}>{children}</AuthContext.Provider>
}
