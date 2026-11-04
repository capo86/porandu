import type { ScoreFn } from '@/lib/scoring/types'
import { pendingScoring } from '@/lib/scoring/validate'

export const scoreChaside: ScoreFn = (answers) => pendingScoring('chaside', answers)
