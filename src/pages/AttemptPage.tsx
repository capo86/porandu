import { Link, useLocation } from 'react-router-dom'
import { tokenSchema } from '@/features/tests/schema'
import AttemptContent from '@/features/tests/AttemptContent'

export function Component() {
  const { hash } = useLocation()
  const parsed = tokenSchema.safeParse(hash.slice(1))
  if (!parsed.success) return <div className="narrow-shell py-20"><h1 className="page-title">Falta tu enlace privado.</h1><p className="mt-4 text-muted">Abrí el enlace completo que guardaste al comenzar el test.</p><Link to="/retomar" className="btn btn-primary mt-7">Ingresar mi enlace</Link></div>
  return <AttemptContent key={parsed.data} token={parsed.data} />
}
