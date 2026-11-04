import { getSupabase } from '@/lib/supabase'
import { attemptSchema, tokenSchema, type Attempt } from '@/features/tests/schema'
import type { Answers } from '@/data/tests/types'
import { validateAnswers } from '@/lib/scoring/validate'

export function friendlyError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : ''
  if (message.includes('REVISION_CONFLICT')) return 'Este test cambió en otra pestaña. Recargá la página para recuperar el último avance guardado.'
  if (message.includes('ATTEMPT_NOT_FOUND')) return 'No encontramos este intento. Revisá que el enlace privado esté completo.'
  if (message.includes('ATTEMPT_COMPLETED')) return 'Este test ya fue enviado. Recargá para ver su estado.'
  if (message.includes('INCOMPLETE_ANSWERS')) return 'Todavía faltan respuestas. Revisá el cuestionario antes de enviarlo.'
  if (message.includes('UNKNOWN_TEST_VERSION')) return 'Este cuestionario se actualizó. Volvé al inicio para comenzar la versión vigente.'
  return 'No pudimos conectar. Revisá tu conexión e intentá de nuevo; podés volver a pulsar el botón.'
}

export async function getAttempt(token: string): Promise<Attempt> {
  tokenSchema.parse(token)
  const { data, error } = await getSupabase().rpc('get_attempt', { p_token: token })
  if (error) throw new Error(friendlyError(error))
  const attempt = attemptSchema.parse(data)
  validateAnswers(attempt.code, attempt.answers, attempt.status === 'completed')
  return attempt
}

export async function saveAttempt(token: string, answers: Answers, revision: number): Promise<Attempt> {
  tokenSchema.parse(token)
  const { data, error } = await getSupabase().rpc('save_attempt', { p_token: token, p_answers: answers, p_revision: revision })
  if (error) throw new Error(friendlyError(error))
  return attemptSchema.parse(data)
}

export async function completeAttempt(token: string, revision: number): Promise<Attempt> {
  tokenSchema.parse(token)
  const { data, error } = await getSupabase().rpc('complete_attempt', { p_token: token, p_revision: revision })
  if (error) throw new Error(friendlyError(error))
  return attemptSchema.parse(data)
}
