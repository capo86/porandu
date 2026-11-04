import type { ScoreFn } from '@/lib/scoring/types'
import { pendingScoring } from '@/lib/scoring/validate'

export const scoreEysenck: ScoreFn = (answers) => pendingScoring('eysenck', answers)
