import type { Answers, TestCode } from '@/data/tests/types'
import { getTest } from '@/data/tests/catalog'
import type { ScoreResult } from '@/lib/scoring/types'

export function validateAnswers(code: TestCode, answers: Answers, complete = true) {
  const test = getTest(code)
  if (!test) throw new Error('Test desconocido.')
  const entries = Object.entries(answers)
  if (complete && entries.length !== test.itemCount) throw new Error('Respondé todas las preguntas antes de continuar.')
  for (const [id, value] of entries) {
    if (!/^[1-9]\d*$/.test(id) || Number(id) > test.itemCount || !test.options.some((option) => option.value === value)) {
      throw new Error('Encontramos una respuesta no válida.')
    }
  }
}

export function pendingScoring(code: TestCode, answers: Answers): ScoreResult {
  validateAnswers(code, answers)
  // TODO: add professionally approved, versioned scoring keys and interpretation tables.
  return {
    scores: {},
    interpretation: { status: 'pending_validation', message: 'La corrección estará disponible cuando el profesional valide las claves y los baremos.' },
    scoring_version: 'pending-professional-validation-v1',
  }
}
