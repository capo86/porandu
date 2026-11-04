import { describe, expect, it } from 'vitest'
import type { Answers, AnswerValue } from '@/data/tests/types'
import { scoreHeymans } from '@/lib/scoring/heymans'
import { scoreChaside } from '@/lib/scoring/chaside'
import { scoreEysenck } from '@/lib/scoring/eysenck'

// Synthetic answers only. No clinical reference scores are asserted until approval.
const cases = [
  { code: 'heymans', score: scoreHeymans, count: 30, values: ['X', 'Z'] },
  { code: 'chaside', score: scoreChaside, count: 98, values: ['SI', 'NO'] },
  { code: 'eysenck', score: scoreEysenck, count: 57, values: ['SI', 'NO'] },
] as const

for (const { code, score, count, values } of cases) {
  const answers = (select: (index: number) => AnswerValue): Answers => Object.fromEntries(Array.from({ length: count }, (_, index) => [String(index + 1), select(index)]))
  describe(`${code}: pending professional validation`, () => {
    for (const [pattern, getValue] of [
      ['all first option (all YES for binary tests)', () => values[0]],
      ['all second option (all NO for binary tests)', () => values[1]],
      ['mixed', (i: number) => values[i % 2 === 0 ? 0 : 1]],
    ] as const) {
      it(`accepts synthetic ${pattern} answers without inventing scores`, () => {
        const input = answers(getValue)
        const before = structuredClone(input)
        const result = score(input)
        expect(result.scores).toEqual({})
        expect(result.interpretation.status).toBe('pending_validation')
        expect(result.scoring_version).toBe('pending-professional-validation-v1')
        expect(input).toEqual(before)
      })
    }
    it('rejects incomplete answers', () => {
      const input = answers(() => values[0]); delete input['1']
      expect(() => score(input)).toThrow('todas las preguntas')
    })
    it('rejects empty answers', () => expect(() => score({})).toThrow())
    it('rejects answers from another test format', () => {
      expect(() => score({ ...answers(() => values[0]), 1: code === 'heymans' ? 'SI' : 'X' })).toThrow('no válida')
    })
    it('rejects replacing a missing item with an out-of-range ID', () => {
      const input = answers(() => values[0]); delete input['1']; input[String(count + 1)] = values[0]
      expect(() => score(input)).toThrow('no válida')
    })
  })
}
