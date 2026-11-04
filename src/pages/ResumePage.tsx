import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokenSchema } from '@/features/tests/schema'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'

export function Component() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = String(new FormData(event.currentTarget).get('link') ?? '').trim()
    let token = value
    if (value.includes('#')) {
      try {
        const url = new URL(value, window.location.origin)
        if (url.origin !== window.location.origin || url.pathname !== '/intento') throw new Error('INVALID_LINK')
        token = url.hash.slice(1)
      } catch { setError('Usá el enlace privado de esta plataforma.'); return }
    }
    const parsed = tokenSchema.safeParse(token)
    if (!parsed.success) { setError('Revisá el enlace. Necesitamos la dirección completa o su código privado.'); return }
    void navigate(`/intento#${parsed.data}`)
  }
  return <div className="narrow-shell pt-14 sm:pt-20"><div className="mb-6 grid size-13 place-items-center rounded-full bg-sage text-forest"><Icon name="leaf" className="size-6" /></div><p className="eyebrow mb-3">CONTINUÁ A TU RITMO</p><h1 className="page-title">Volvé a tu recorrido.</h1><p className="mt-4 max-w-lg text-base leading-7 text-muted">Pegá el enlace privado que guardaste al comenzar. Vas a poder retomar donde quedaste o consultar el estado de tu resultado.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-line bg-white/60 p-6 sm:p-8"><div><label htmlFor="resume-link" className="field-label">Tu enlace o código privado</label><input id="resume-link" name="link" type="text" required autoComplete="off" spellCheck={false} className="field" placeholder="Pegá tu enlace acá" aria-describedby="resume-help" /><p id="resume-help" className="mt-2 text-xs leading-5 text-muted">Por privacidad, no se pueden buscar resultados por nombre, documento o correo.</p></div>{error ? <Notice error>{error}</Notice> : null}<Button type="submit" className="w-full">Abrir mi test<Icon name="arrow" /></Button></form><p className="mt-5 text-xs leading-6 text-muted">Tu enlace es personal: cualquier persona que lo tenga puede acceder a tu cuestionario. Si lo perdiste, contactá al profesional que te facilitó el test.</p></div>
}
