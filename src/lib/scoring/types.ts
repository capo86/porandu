import type { Answers } from '@/data/tests/types'

export type ScoreResult = {
  scores: Record<string, number>
  interpretation: { status: 'pending_validation'; message: string }
  scoring_version: string
}
export type ScoreFn = (answers: Answers) => ScoreResult
