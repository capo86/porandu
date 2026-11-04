import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthState = { session: Session | null; loading: boolean; recovery: boolean; clearRecovery: () => void }
export const AuthContext = createContext<AuthState | null>(null)
