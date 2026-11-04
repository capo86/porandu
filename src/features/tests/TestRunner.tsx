import { useEffect, useRef, useState } from 'react'
import type { TestDefinition, Answers } from '@/data/tests/types'
import type { Attempt } from '@/features/tests/schema'
import { completeAttempt, saveAttempt } from '@/features/tests/api'
import { isDemo } from '@/lib/config'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Notice from '@/components/Notice'
import ProgressBar from '@/components/ProgressBar'
import PrivateLink from '@/components/PrivateLink'

export default function TestRunner({ token, test, initial, onComplete }: { token: string; test: TestDefinition; initial: Attempt; onComplete: (attempt: Attempt) => void }) {
  const [attempt, setAttempt] = useState(initial)
  const [answers, setAnswers] = useState<Answers>(initial.answers)
  const [index, setIndex] = useState(() => {
    const missing = test.items.findIndex((item) => !initial.answers[String(item.id)])
    return missing < 0 ? test.items.length : missing
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const item = test.items[index]
  const answered = Object.keys(answers).length
  const dirty = JSON.stringify(answers) !== JSON.stringify(attempt.answers)

  useEffect(() => { heading.current?.focus() }, [index])
  useEffect(() => {
    if (!dirty) return
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault() }
    window.addEventListener('beforeunload', preventLoss)
    return () => window.removeEventListener('beforeunload', preventLoss)
  }, [dirty])

  async function move(nextIndex: number) {
    if (busy) return
    setBusy(true); setError('')
    try {
      if (dirty) {
        const next = await saveAttempt(token, answers, attempt.revision)
        setAttempt(next)
      }
      setIndex(nextIndex)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos guardar. Intentá de nuevo.') }
    finally { setBusy(false) }
  }

  async function finish() {
    if (busy || answered !== test.itemCount) return
    setBusy(true); setError('')
    try { onComplete(await completeAttempt(token, attempt.revision)) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos enviar. Intentá de nuevo.') }
    finally { setBusy(false) }
  }

  return <div className="narrow-shell pt-9 sm:pt-12"><div className="mb-7 flex items-center justify-between gap-3"><div><p className="eyebrow mb-1">{test.category}</p><p className="font-display text-2xl">{test.name}</p></div><span className="pill text-xs"><Icon name="lock" className="size-3.5" />Tu espacio privado</span></div><ProgressBar answered={answered} total={test.itemCount} /><div className="mt-6"><PrivateLink token={token} /></div>
    <div className="mt-6 rounded-2xl border border-line bg-white/70 p-5 sm:p-9">
      {item ? <>
        <p className="eyebrow mb-4">PREGUNTA {index + 1} <span className="font-normal text-muted">DE {test.itemCount}</span></p>
        <h1 ref={heading} tabIndex={-1} id="question-heading" className="font-display text-[26px] leading-snug tracking-[-.01em] focus:outline-none sm:text-[32px]">{item.text}</h1>
        <fieldset aria-labelledby="question-heading" disabled={busy} className="mt-7 space-y-3"><legend className="sr-only">Elegí una respuesta</legend>{test.options.map((option) => <label key={option.value} className={`flex min-h-17 cursor-pointer items-start gap-4 rounded-xl border p-5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-forest has-focus-visible:ring-offset-2 ${answers[String(item.id)] === option.value ? 'border-forest bg-sage/40 text-forest' : 'border-line hover:border-forest/40 hover:bg-paper'}`}><input type="radio" name={`question-${item.id}`} value={option.value} checked={answers[String(item.id)] === option.value} onChange={() => setAnswers((current) => ({ ...current, [String(item.id)]: option.value }))} className="mt-1 size-5 shrink-0 accent-forest" /><span className="text-base leading-7">{item.optionLabels?.[option.value] ?? option.label}</span></label>)}</fieldset>
        <div className="mt-8 flex justify-between gap-3 border-t border-line pt-6"><Button variant="ghost" disabled={index === 0 || busy} onClick={() => void move(index - 1)}><Icon name="back" className="size-4" /><span className="hidden min-[400px]:inline">Anterior</span></Button><Button disabled={!answers[String(item.id)]} busy={busy} onClick={() => void move(index + 1)}>{index + 1 === test.itemCount ? 'Revisar respuestas' : 'Continuar'}<Icon name="arrow" className="size-4" /></Button></div>
        <p className="mt-4 text-center text-xs leading-5 text-muted" role="status">{busy ? 'Guardando tu respuesta…' : dirty ? 'Pulsá Continuar para guardar esta respuesta.' : isDemo ? 'Avance de prueba: se borra al recargar.' : 'Tu avance está guardado.'}</p>
      </> : <>
        <div className="mb-5 grid size-12 place-items-center rounded-full bg-sage text-forest"><Icon name="check" className="size-6" /></div><p className="eyebrow mb-3">UN ÚLTIMO PASO</p><h1 ref={heading} tabIndex={-1} className="page-title text-3xl focus:outline-none">Tu recorrido está completo.</h1><p className="mt-4 text-sm leading-7 text-muted">Respondiste {answered} de {test.itemCount} preguntas. Si querés cambiar alguna respuesta, seleccioná su número antes de enviar.</p>
        <div className="my-6 grid grid-cols-6 gap-2 sm:grid-cols-10" aria-label="Revisar preguntas">{test.items.map((question) => <button key={question.id} onClick={() => void move(question.id - 1)} disabled={busy} aria-label={`Revisar pregunta ${question.id}${answers[String(question.id)] ? ', respondida' : ', sin responder'}`} className={`min-h-10 rounded-lg border text-sm transition hover:border-forest ${answers[String(question.id)] ? 'border-forest/20 bg-sage/40 text-forest' : 'border-clay text-clay'}`}>{question.id}</button>)}</div>
        <Notice>Después de enviar, las respuestas quedan cerradas. La corrección está pendiente de validación profesional; por ahora no se muestran puntajes.</Notice><Button busy={busy} disabled={answered !== test.itemCount} onClick={() => void finish()} className="mt-7 w-full">{busy ? 'Enviando…' : 'Finalizar y guardar'}<Icon name="check" /></Button>
      </>}
      {error ? <div className="mt-5"><Notice error>{error}</Notice></div> : null}
    </div>
    <p className="mt-6 text-center text-xs leading-5 text-muted">Respirá. No hay respuestas buenas o malas.<br />Elegí lo que mejor te representa.</p>
  </div>
}
