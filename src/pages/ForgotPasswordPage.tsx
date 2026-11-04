import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import { requestPasswordReset } from '@/features/auth/api'
import { isConfigured } from '@/lib/config'

export function Component() {
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const email = String(new FormData(event.currentTarget).get('email') ?? '')
    setBusy(true); setError('')
    try { await requestPasswordReset(email); setSent(true) }
    catch { setError('No pudimos procesar la solicitud. Intentá de nuevo más tarde.') }
    finally { setBusy(false) }
  }
  return <div className="narrow-shell max-w-[580px] pt-12 sm:pt-20"><Link to="/ingresar" className="back-link"><Icon name="back" className="size-4" />Volver a ingresar</Link><p className="eyebrow mt-8 mb-3">RECUPERAR ACCESO</p><h1 className="page-title">Recuperá tu contraseña.</h1><p className="mt-4 text-base leading-7 text-muted">Ingresá el correo asociado a tu cuenta profesional.</p><div className="mt-8 rounded-2xl border border-line bg-white/60 p-6 sm:p-8">{sent ? <div role="status"><div className="mb-4 grid size-12 place-items-center rounded-full bg-sage text-forest"><Icon name="check" /></div><h2 className="font-display text-2xl">Revisá tu correo.</h2><p className="mt-3 text-sm leading-6 text-muted">Si existe una cuenta con ese correo, recibirás un enlace para elegir una nueva contraseña.</p><Link to="/ingresar" className="btn btn-secondary mt-6 w-full">Volver a ingresar</Link></div> : <form onSubmit={submit} className="space-y-5"><div><label htmlFor="reset-email" className="field-label">Correo electrónico</label><input id="reset-email" name="email" type="email" autoComplete="email" required className="field" /></div>{!isConfigured ? <Notice error>La recuperación no está disponible en este momento.</Notice> : null}{error ? <Notice error>{error}</Notice> : null}<Button type="submit" busy={busy} disabled={!isConfigured} className="w-full">{busy ? 'Enviando…' : 'Enviar enlace'}<Icon name="arrow" /></Button></form>}</div></div>
}
