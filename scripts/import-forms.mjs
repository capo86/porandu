import { mkdir, writeFile } from 'node:fs/promises'

const sources = {
  heymans: 'https://forms.gle/WovzZSVarEf4Z8mc8',
  chaside: 'https://forms.gle/UrpnH8BnGXiWi7te7',
  eysenck: 'https://forms.gle/qHPqUFZLQ8HvSwEf6',
}

await mkdir('tmp/forms', { recursive: true })
await mkdir('src/data/tests', { recursive: true })
await Promise.all(Object.entries(sources).map(async ([code, url]) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${code}: HTTP ${response.status}`)
  const html = await response.text()
  const match = html.match(/var FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);<\/script>/)
  if (!match) throw new Error(`${code}: public form data unavailable`)
  const data = JSON.parse(match[1])
  await writeFile(`tmp/forms/${code}.json`, JSON.stringify(data, null, 2))
  const items = data[1][1]
    .filter((item) => item[3] === 2 && /^\d+[.\s]/.test(item[1]))
    .map((item) => {
      const match = item[1].match(/^(\d+)[.\s]+([\s\S]*)$/)
      const id = Number(match[1])
      const text = match[2].trim()
      if (code !== 'heymans') return { id, text }
      const labels = text.match(/^\[X\]\s*([\s\S]*?)\s*O\s*\[Z\]\s*([\s\S]*)$/)
      if (!labels) throw new Error(`Cannot split Heymans item ${id}`)
      return { id, text: 'Elegí el enunciado que más te representa.', optionLabels: { X: labels[1].trim(), Z: labels[2].trim() } }
    })
  const count = { heymans: 30, chaside: 98, eysenck: 57 }[code]
  if (items.length !== count || items.some((item, index) => item.id !== index + 1)) {
    throw new Error(`${code}: expected ${count} sequential items, found ${items.length}`)
  }
  const file = `// Source: ${url}\n// Imported from the public questionnaire. Do not change wording without a new version.\nimport type { TestItem } from '@/data/tests/types'\n\nexport const items = ${JSON.stringify(items, null, 2)} satisfies TestItem[]\n`
  await writeFile(`src/data/tests/${code}.ts`, file)
  console.log(`${code}: imported and validated ${items.length} items`)
}))
