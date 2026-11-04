import type { TestCode, TestDefinition } from '@/data/tests/types'

export const catalog: Omit<TestDefinition, 'items'>[] = [
  {
    code: 'heymans', name: 'Heymans', category: 'Carácter', version: 'forms-v1', itemCount: 30,
    description: 'Descubrí cómo sentís, actuás y respondés a lo que te pasa.',
    detail: 'Un cuestionario sobre tu manera de sentir y actuar. En cada pregunta, elegí entre dos enunciados el que más te represente.',
    options: [{ value: 'X', label: 'Opción X' }, { value: 'Z', label: 'Opción Z' }],
  },
  {
    code: 'chaside', name: 'CHASIDE', category: 'Orientación vocacional', version: 'forms-v1', itemCount: 98,
    description: 'Explorá tus intereses y aptitudes para pensar tu próximo paso.',
    detail: 'Un recorrido por tus intereses y aptitudes. Respondé sí o no a cada pregunta, pensando en lo que te gusta y en tu experiencia.',
    options: [{ value: 'SI', label: 'Sí' }, { value: 'NO', label: 'No' }],
  },
  {
    code: 'eysenck', name: 'Eysenck', category: 'Personalidad', version: 'forms-v1', itemCount: 57,
    description: 'Conocé un poco más sobre tu forma de relacionarte con el mundo.',
    detail: 'Preguntas sobre situaciones de la vida cotidiana y tu manera habitual de responder. Elegí sí o no según lo que mejor te describa.',
    options: [{ value: 'SI', label: 'Sí' }, { value: 'NO', label: 'No' }],
  },
]

export function getTest(code: string | undefined) {
  return catalog.find((test) => test.code === code)
}

const loaders = {
  heymans: () => import('@/data/tests/heymans'),
  chaside: () => import('@/data/tests/chaside'),
  eysenck: () => import('@/data/tests/eysenck'),
}

export async function loadTest(code: TestCode): Promise<TestDefinition> {
  const metadata = getTest(code)
  if (!metadata) throw new Error('No encontramos este test.')
  const { items } = await loaders[code]()
  return { ...metadata, items }
}
