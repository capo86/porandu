import { Link, useParams } from 'react-router-dom'
import { getTest } from '@/data/tests/catalog'
import Icon from '@/components/Icon'
import TestArtwork from '@/components/TestArtwork'
import Notice from '@/components/Notice'
import { isDemo } from '@/lib/config'

export function Component() {
  const { code } = useParams()
  const test = getTest(code)
  if (!test) return <div className="narrow-shell py-20"><h1 className="page-title">No encontramos este test.</h1><Link to="/" className="btn btn-primary mt-6">Volver al inicio</Link></div>
  return <div className="narrow-shell pt-9 sm:pt-14"><Link to="/#tests" className="back-link"><Icon name="back" className="size-4" />Volver a los tests</Link><div className="mt-8 grid gap-4 sm:grid-cols-[1fr_150px] sm:items-center"><div><p className="eyebrow mb-3">{test.category}</p><h1 className="page-title">{test.name}</h1></div><TestArtwork code={test.code} className="hidden h-32 w-40 text-forest sm:block" /></div><p className="mt-4 text-lg leading-8 text-muted">{test.detail}</p><div className="my-8 flex flex-wrap gap-3"><span className="pill"><Icon name="question" className="size-4" />{test.itemCount} preguntas</span><span className="pill"><Icon name="lock" className="size-4" />Sin crear una cuenta</span><span className="pill"><Icon name="clock" className="size-4" />A tu ritmo</span></div><div className="rounded-2xl border border-line bg-white/60 p-6 sm:p-8"><h2 className="font-display text-2xl">Antes de empezar</h2><ul className="mt-5 space-y-4 text-sm leading-6 text-muted"><li className="flex gap-3"><Icon name="check" />Elegí la respuesta que mejor describa tu experiencia habitual.</li><li className="flex gap-3"><Icon name="check" />Vas a ver una pregunta a la vez y podés volver para revisar.</li><li className="flex gap-3"><Icon name="check" />Cada respuesta se guarda cuando pulsás Continuar. Conservá tu enlace privado para retomar.</li></ul><div className="mt-6"><Notice>La corrección está pendiente de validación profesional. Por ahora se guardan tus respuestas y el estado del cuestionario. Los resultados son orientativos y no reemplazan una evaluación profesional.</Notice></div><Link to={`/tests/${test.code}/datos`} className="btn btn-primary mt-7 w-full sm:w-auto">{isDemo ? 'Probar el cuestionario' : 'Empezar mi test'}<Icon name="arrow" /></Link><p className="mt-3 text-xs text-muted">Primero completás tus datos y el consentimiento.</p></div></div>
}
