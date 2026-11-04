import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { signIn } from '@/features/auth/api'
import { useAuth } from '@/features/auth/useAuth'
import { isConfigured } from '@/lib/config'

export function Component() {
  const { session, loading, recovery } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try { await signIn(String(form.get('email') ?? ''), String(form.get('password') ?? '')) }
    catch (cause) {
      const status = cause && typeof cause === 'object' && 'status' in cause ? cause.status : undefined
      setError(status === 400 || status === 401 ? 'Revisá tu correo y contraseña e intentá de nuevo.' : 'No pudimos iniciar sesión. Revisá tu conexión e intentá de nuevo.')
    } finally { setBusy(false) }
  }

  if (loading) return <div className="narrow-shell py-24 text-center text-muted" role="status">Comprobando tu sesión…</div>
  if (session) return <Navigate to={recovery ? '/recuperar/actualizar' : '/profesional'} replace />
  return <div className="narrow-shell max-w-[580px] pt-12 sm:pt-20"><div className="mb-6 grid size-13 place-items-center rounded-full bg-sage text-forest"><Icon name="lock" className="size-6" /></div><p className="eyebrow mb-3">ESPACIO PARA PROFESIONALES</p><h1 className="page-title">Bienvenido de nuevo.</h1><p className="mt-4 text-base leading-7 text-muted">Ingresá con la cuenta que te facilitó el administrador de porandu.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-line bg-white/60 p-6 sm:p-8"><div><label htmlFor="login-email" className="field-label">Correo electrónico</label><input id="login-email" name="email" type="email" required autoComplete="username" className="field" /></div><div><label htmlFor="login-password" className="field-label">Contraseña</label><input id="login-password" name="password" type="password" required autoComplete="current-password" className="field" /></div>{!isConfigured ? <Notice error>El acceso profesional no está disponible en este momento.</Notice> : null}{error ? <Notice error>{error}</Notice> : null}<Button type="submit" busy={busy} disabled={!isConfigured} className="w-full">{busy ? 'Ingresando…' : 'Ingresar'}<Icon name="arrow" /></Button><Link to="/recuperar" className="block text-center text-sm text-forest underline underline-offset-4">Olvidé mi contraseña</Link></form><p className="mt-5 text-xs leading-6 text-muted">Si todavía no tenés una cuenta, contactá al administrador.</p></div>
}
