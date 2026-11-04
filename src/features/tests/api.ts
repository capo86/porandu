import { getSupabase } from '@/lib/supabase'
import { isDemo } from '@/lib/config'
import { attemptSchema, tokenSchema, type Attempt } from '@/features/tests/schema'
import type { Answers } from '@/data/tests/types'
import { getTest } from '@/data/tests/catalog'
import { pendingScoring, validateAnswers } from '@/lib/scoring/validate'

// Demo answers live only in memory and disappear on reload.
const demoAttempts = new Map<string, Attempt>()

export function createDemoAttempt(code: string, version: string) {
  const test = getTest(code)
  if (!test || test.version !== version) throw new Error('Test desconocido.')
  const token = crypto.randomUUID()
  demoAttempts.set(token, { code: test.code, version, status: 'in_progress', answers: {}, revision: 0, started_at: new Date().toISOString(), completed_at: null, result: null })
  return token
}

export function friendlyError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : ''
  if (message.includes('REVISION_CONFLICT')) return 'Este test cambió en otra pestaña. Recargá la página para recuperar el último avance guardado.'
  if (message.includes('ATTEMPT_NOT_FOUND')) return 'No encontramos este intento. Revisá que el enlace privado esté completo.'
  if (message.includes('ATTEMPT_COMPLETED')) return 'Este test ya fue enviado. Recargá para ver su estado.'
  if (message.includes('INCOMPLETE_ANSWERS')) return 'Todavía faltan respuestas. Revisá el cuestionario antes de enviarlo.'
  if (message.includes('UNKNOWN_TEST_VERSION')) return 'Este cuestionario se actualizó. Volvé al inicio para comenzar la versión vigente.'
  return 'No pudimos conectar. Revisá tu conexión e intentá de nuevo; podés volver a pulsar el botón.'
}

function demoAttempt(token: string) {
  const attempt = demoAttempts.get(token)
  if (!attempt) throw new Error('La vista de prueba se reinició. Volvé al inicio para probar otro cuestionario.')
  return structuredClone(attempt)
}

export async function getAttempt(token: string): Promise<Attempt> {
  tokenSchema.parse(token)
  if (isDemo) return demoAttempt(token)
  const { data, error } = await getSupabase().rpc('get_attempt', { p_token: token })
  if (error) throw new Error(friendlyError(error))
  const attempt = attemptSchema.parse(data)
  validateAnswers(attempt.code, attempt.answers, attempt.status === 'completed')
  return attempt
}

export async function saveAttempt(token: string, answers: Answers, revision: number): Promise<Attempt> {
  tokenSchema.parse(token)
  if (isDemo) {
    const attempt = demoAttempt(token)
    if (attempt.revision !== revision) throw new Error(friendlyError({ message: 'REVISION_CONFLICT' }))
    if (attempt.status !== 'in_progress') throw new Error(friendlyError({ message: 'ATTEMPT_COMPLETED' }))
    validateAnswers(attempt.code, answers, false)
    const next = { ...attempt, answers, revision: revision + 1 }
    demoAttempts.set(token, structuredClone(next))
    return next
  }
  const { data, error } = await getSupabase().rpc('save_attempt', { p_token: token, p_answers: answers, p_revision: revision })
  if (error) throw new Error(friendlyError(error))
  return attemptSchema.parse(data)
}

export async function completeAttempt(token: string, revision: number): Promise<Attempt> {
  tokenSchema.parse(token)
  if (isDemo) {
    const attempt = demoAttempt(token)
    if (attempt.status === 'completed') return attempt
    if (attempt.revision !== revision) throw new Error(friendlyError({ message: 'REVISION_CONFLICT' }))
    const next: Attempt = { ...attempt, status: 'completed', completed_at: new Date().toISOString(), revision: revision + 1, result: pendingScoring(attempt.code, attempt.answers) }
    demoAttempts.set(token, structuredClone(next))
    return next
  }
  const { data, error } = await getSupabase().rpc('complete_attempt', { p_token: token, p_revision: revision })
  if (error) throw new Error(friendlyError(error))
  return attemptSchema.parse(data)
}
