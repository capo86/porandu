import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTest } from '@/data/tests/catalog'
import { patientSchema } from '@/features/patients/schema'
import { startTest } from '@/features/patients/api'
import { isDemo } from '@/lib/config'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'

export function Component() {
  const { code } = useParams()
  const test = getTest(code)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!test || busy) return
    const form = new FormData(event.currentTarget)
    const parsed = patientSchema.safeParse({ ...Object.fromEntries(form), consent: form.get('consent') === 'on' })
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
      setError('Revisá los campos marcados antes de continuar.')
      return
    }
    setBusy(true); setError(''); setErrors({})
    try {
      const token = await startTest(test.code, test.version, parsed.data)
      await navigate(`/intento#${token}`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos iniciar el test. Intentá de nuevo.') }
    finally { setBusy(false) }
  }

  if (!test) return <div className="narrow-shell py-20"><h1 className="page-title">Test no encontrado</h1><Link to="/">Volver al inicio</Link></div>
  return <div className="narrow-shell pt-9 sm:pt-14"><Link to={`/tests/${test.code}`} className="back-link"><Icon name="back" className="size-4" />Volver a {test.name}</Link><p className="eyebrow mt-9 mb-3">ANTES DE COMENZAR</p><h1 className="page-title">Este espacio es para vos.</h1><p className="mt-4 mb-8 text-base leading-7 text-muted">Solo necesitamos tu nombre y tu consentimiento. Los demás datos son opcionales.</p>{isDemo ? <div className="mb-6"><Notice>Estás en la vista de prueba. Usá datos ficticios: nada se envía a una base de datos y el avance se pierde al recargar.</Notice></div> : null}
    <form onSubmit={submit} noValidate className="space-y-6 rounded-2xl border border-line bg-white/60 p-5 sm:p-8">
      <div><label htmlFor="full_name" className="field-label">Nombre completo <span className="text-clay">*</span></label><input id="full_name" name="full_name" autoComplete="name" required maxLength={160} className="field" placeholder={isDemo ? 'Ej.: Persona de prueba' : 'Tu nombre y apellido'} aria-invalid={Boolean(errors.full_name)} aria-describedby={errors.full_name ? 'name-error' : undefined} /><p id="name-error" className="field-error">{errors.full_name}</p></div>
      <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="email" className="field-label">Correo electrónico <span className="field-optional">opcional</span></label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} className="field" placeholder="vos@ejemplo.com" aria-invalid={Boolean(errors.email)} aria-describedby="email-error" /><p id="email-error" className="field-error">{errors.email}</p></div><div><label htmlFor="phone" className="field-label">Teléfono <span className="field-optional">opcional</span></label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="field" placeholder="09xx xxx xxx" /><p className="field-error">{errors.phone}</p></div></div>
      <details className="rounded-xl border border-line px-4 py-3"><summary className="cursor-pointer py-1 text-sm text-muted">Agregar otros datos opcionales</summary><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><label htmlFor="document_number" className="field-label">N.º de documento</label><input id="document_number" name="document_number" maxLength={40} className="field" /><p className="field-error">{errors.document_number}</p></div><div><label htmlFor="birth_date" className="field-label">Fecha de nacimiento</label><input id="birth_date" name="birth_date" type="date" min="1900-01-01" className="field" aria-invalid={Boolean(errors.birth_date)} aria-describedby="birth-error" /><p id="birth-error" className="field-error">{errors.birth_date}</p></div><div className="sm:col-span-2"><label htmlFor="sex" className="field-label">Sexo</label><select id="sex" name="sex" className="field" defaultValue=""><option value="">Sin especificar</option><option value="female">Mujer</option><option value="male">Hombre</option><option value="other">Otro</option><option value="prefer_not_to_say">Prefiero no responder</option></select></div></div></details>
      <div className="border-t border-line pt-6"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" name="consent" required className="mt-1 size-5 shrink-0 accent-forest" aria-invalid={Boolean(errors.consent)} aria-describedby="consent-error" /><span className="text-sm leading-6 text-muted">Acepto que se guarden mis datos y respuestas para completar este cuestionario y consultar su resultado. Entiendo que la corrección está pendiente de validación y que los resultados no reemplazan una evaluación profesional. Leí la <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-3">información de privacidad</Link>.</span></label><p id="consent-error" className="field-error">{errors.consent}</p></div>
      {error ? <Notice error>{error}</Notice> : null}<Button type="submit" busy={busy} className="w-full">{busy ? 'Preparando tu test…' : 'Aceptar y continuar'}<Icon name="arrow" /></Button>
    </form>
  </div>
}
