import { z } from 'zod'
import { testCodes } from '@/data/tests/types'

export const tokenSchema = z.uuid()
export const attemptSchema = z.object({
  code: z.enum(testCodes),
  version: z.string(),
  status: z.enum(['in_progress', 'completed']),
  answers: z.record(z.string(), z.enum(['X', 'Z', 'SI', 'NO'])),
  revision: z.number().int().nonnegative(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
  result: z.object({
    scores: z.record(z.string(), z.number()),
    interpretation: z.object({ status: z.literal('pending_validation'), message: z.string() }),
    scoring_version: z.string(),
  }).nullable(),
})
export type Attempt = z.infer<typeof attemptSchema>
