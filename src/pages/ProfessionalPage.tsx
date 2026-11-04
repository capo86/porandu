import { useState } from 'react'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { signOut } from '@/features/auth/api'
import { useAuth } from '@/features/auth/useAuth'

export function Component() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function logout() {
    if (busy) return
    setBusy(true); setError('')
    try { await signOut() }
    catch { setError('No pudimos cerrar la sesión. Revisá tu conexión e intentá de nuevo.') }
    finally { setBusy(false) }
  }
  return <div className="page-shell pt-12 sm:pt-18"><div className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">TU ESPACIO PROFESIONAL</p><h1 className="page-title">Bienvenido a porandu.</h1><p className="mt-4 text-sm text-muted">Sesión iniciada como <span className="font-medium text-ink">{session?.user.email}</span></p></div><Button variant="secondary" busy={busy} onClick={() => void logout()}>{busy ? 'Cerrando sesión…' : 'Cerrar sesión'}</Button></div>{error ? <div className="mt-6"><Notice error>{error}</Notice></div> : null}<div className="mt-10 max-w-xl rounded-2xl border border-line bg-white/60 p-6 sm:p-8"><div className="mb-5 grid size-12 place-items-center rounded-full bg-sage text-forest"><Icon name="leaf" /></div><p className="eyebrow mb-3">UN ESPACIO PARA ACOMPAÑAR</p><h2 className="font-display text-2xl">Tu panel profesional</h2><p className="mt-3 text-sm leading-7 text-muted">Próximamente vas a poder organizar tus pacientes, compartir cuestionarios y consultar sus resultados desde acá.</p></div></div>
}
