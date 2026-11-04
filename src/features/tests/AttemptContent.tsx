import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAttempt } from '@/features/tests/api'
import type { Attempt } from '@/features/tests/schema'
import { getTest, loadTest } from '@/data/tests/catalog'
import type { TestDefinition } from '@/data/tests/types'
import TestRunner from '@/features/tests/TestRunner'
import ResultView from '@/features/results/ResultView'
import Notice from '@/components/Notice'

export default function AttemptContent({ token }: { token: string }) {
  const [state, setState] = useState<{ attempt: Attempt; test: TestDefinition }>()
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const attempt = await getAttempt(token)
        if (getTest(attempt.code)?.version !== attempt.version) throw new Error('Este intento usa una versión anterior del cuestionario. Contactá al profesional que te compartió el enlace.')
        const test = await loadTest(attempt.code)
        if (active) { setState({ attempt, test }); setError('') }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'No pudimos recuperar tu test.') }
    }
    void load()
    return () => { active = false }
  }, [token, retry])
  if (error) return <div className="narrow-shell py-16"><h1 className="page-title mb-6">No pudimos abrir tu test.</h1><Notice error>{error}</Notice><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setRetry((value) => value + 1)} className="btn btn-primary">Intentar de nuevo</button><Link to="/retomar" className="btn btn-secondary">Revisar mi enlace</Link><Link to="/" className="btn btn-ghost">Volver al inicio</Link></div></div>
  if (!state) return <div className="narrow-shell py-24 text-center" role="status"><span className="mx-auto mb-5 block size-8 animate-spin rounded-full border-2 border-line border-t-forest" /><p className="text-muted">Recuperando tu recorrido…</p></div>
  if (state.attempt.status === 'completed') return <ResultView token={token} test={state.test} attempt={state.attempt} />
  return <TestRunner token={token} test={state.test} initial={state.attempt} onComplete={(attempt) => setState((current) => current ? { ...current, attempt } : current)} />
}
