import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { updatePassword } from '@/features/auth/api'
import { useAuth } from '@/features/auth/useAuth'

export function Component() {
  const { session, loading, recovery, clearRecovery } = useAuth()
  const { hash, search } = useLocation()
  const [linkError] = useState(() => new URLSearchParams(hash.slice(1)).has('error') || new URLSearchParams(search).has('error'))
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !session || !recovery) return
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== form.get('confirmation')) { setError('Las contraseñas no coinciden.'); return }
    setBusy(true); setError('')
    try { await updatePassword(password); clearRecovery(); setDone(true) }
    catch { setError('No pudimos actualizar tu contraseña. Solicitá un nuevo enlace o intentá de nuevo.') }
    finally { setBusy(false) }
  }
  if (loading) return <div className="narrow-shell py-24 text-center text-muted" role="status">Comprobando tu enlace…</div>
  return <div className="narrow-shell max-w-[580px] pt-12 sm:pt-20"><p className="eyebrow mb-3">RECUPERAR ACCESO</p><h1 className="page-title">Elegí una contraseña nueva.</h1><div className="mt-8 rounded-2xl border border-line bg-white/60 p-6 sm:p-8">{done ? <div role="status"><h2 className="font-display text-2xl">Tu contraseña se actualizó.</h2><p className="mt-3 text-sm leading-6 text-muted">Ya podés continuar a tu espacio profesional.</p><Link to="/profesional" className="btn btn-primary mt-6 w-full">Ir a mi panel<Icon name="arrow" /></Link></div> : linkError || !session || !recovery ? <><Notice error>El enlace no es válido o venció. Solicitá uno nuevo para recuperar tu acceso.</Notice><Link to="/recuperar" className="btn btn-secondary mt-6 w-full">Solicitar otro enlace</Link></> : <form onSubmit={submit} className="space-y-5"><div><label htmlFor="new-password" className="field-label">Nueva contraseña</label><input id="new-password" name="password" type="password" minLength={8} required autoComplete="new-password" className="field" /><p className="mt-2 text-xs text-muted">Usá al menos 8 caracteres.</p></div><div><label htmlFor="confirm-password" className="field-label">Repetir contraseña</label><input id="confirm-password" name="confirmation" type="password" minLength={8} required autoComplete="new-password" className="field" /></div>{error ? <Notice error>{error}</Notice> : null}<Button type="submit" busy={busy} className="w-full">{busy ? 'Guardando…' : 'Guardar contraseña'}<Icon name="arrow" /></Button></form>}</div></div>
}
