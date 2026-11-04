export const testCodes = ['heymans', 'chaside', 'eysenck'] as const
export type TestCode = (typeof testCodes)[number]
export type AnswerValue = 'X' | 'Z' | 'SI' | 'NO'
export type Answers = Record<string, AnswerValue>
export type TestItem = { id: number; text: string; optionLabels?: Partial<Record<AnswerValue, string>> }
export type TestDefinition = {
  code: TestCode
  name: string
  category: string
  description: string
  detail: string
  version: string
  itemCount: number
  options: { value: AnswerValue; label: string }[]
  items: TestItem[]
}
