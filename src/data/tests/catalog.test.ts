import { describe, expect, it } from 'vitest'
import { catalog, loadTest } from '@/data/tests/catalog'

describe('original questionnaires', () => {
  for (const test of catalog) {
    it(`${test.code} contains all sequential questions from the source form`, async () => {
      const definition = await loadTest(test.code)
      expect(definition.items).toHaveLength(test.itemCount)
      expect(definition.items.map((item) => item.id)).toEqual(Array.from({ length: test.itemCount }, (_, index) => index + 1))
      expect(definition.items.every((item) => item.text.trim().length > 0)).toBe(true)
      if (test.code === 'heymans') {
        expect(definition.items.every((item) => item.optionLabels?.X && item.optionLabels.Z)).toBe(true)
        expect(new Set(definition.items.map((item) => item.optionLabels?.X)).size).toBe(30)
      }
    })
  }
})
