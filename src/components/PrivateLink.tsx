import { useState } from 'react'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import { isDemo } from '@/lib/config'

export default function PrivateLink({ token }: { token: string }) {
  const [message, setMessage] = useState('')
  const link = `${window.location.origin}/intento#${token}`
  async function copy() {
    try { await navigator.clipboard.writeText(link); setMessage('Enlace copiado.') }
    catch { setMessage('Seleccioná el enlace de abajo y copialo.') }
  }
  return <details className="rounded-xl border border-line bg-white/50 px-4 py-3 text-sm"><summary className="cursor-pointer py-1 text-forest">{isDemo ? 'Sobre esta vista de prueba' : 'Tu enlace privado para retomar'}</summary>{isDemo ? <p className="mt-3 leading-6 text-muted">Esta prueba guarda el avance en memoria. Al recargar o cerrar la página, se borra. Los enlaces para retomar funcionarán cuando la plataforma esté conectada.</p> : <div className="mt-3 space-y-3"><p className="text-xs leading-5 text-muted">Guardá este enlace en un lugar seguro. Cualquier persona que lo tenga puede ver tus respuestas y el estado de tu resultado.</p><label className="sr-only" htmlFor="private-link">Tu enlace privado</label><input id="private-link" readOnly value={link} className="field text-xs" onFocus={(event) => event.currentTarget.select()} /><Button variant="secondary" onClick={copy} className="min-h-10 text-xs"><Icon name="copy" className="size-4" />Copiar enlace privado</Button><span role="status" className="ml-3 text-xs text-muted">{message}</span></div>}</details>
}
