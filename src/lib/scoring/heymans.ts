import type { ScoreFn } from '@/lib/scoring/types'
import { pendingScoring } from '@/lib/scoring/validate'

export const scoreHeymans: ScoreFn = (answers) => pendingScoring('heymans', answers)
