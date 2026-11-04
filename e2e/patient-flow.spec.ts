import { expect, test } from '@playwright/test'

for (const [code, name, count] of [['heymans', 'Heymans', 30], ['chaside', 'CHASIDE', 98], ['eysenck', 'Eysenck', 57]] as const) {
  test(`${name}: registration, consent, answers, review and pending result`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/tests/${code}`)
    await page.getByRole('link', { name: 'Probar el cuestionario' }).click()
    await page.getByLabel('Nombre completo').fill('Persona ficticia de prueba')
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
    await expect(page.getByRole('alert')).toContainText('Revisá los campos')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    for (let index = 0; index < count; index++) {
      await page.getByRole('radio').nth(index % 2).check()
      await page.getByRole('button', { name: index === count - 1 ? 'Revisar respuestas' : 'Continuar', exact: true }).click()
      if (index === 0) {
        await page.getByRole('button', { name: 'Anterior' }).click()
        await expect(page.getByRole('radio').first()).toBeChecked()
        await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      }
    }
    await expect(page.getByRole('heading', { name: 'Tu recorrido está completo.' })).toBeVisible()
    await page.getByRole('button', { name: 'Revisar pregunta 1, respondida', exact: true }).click()
    await expect(page.getByRole('radio').first()).toBeChecked()
    await page.getByRole('radio').nth(1).check()
    // Return through the preserved answers, then finish.
    for (let i = 0; i < count; i++) await page.getByRole('button', { name: i === count - 1 ? 'Revisar respuestas' : 'Continuar', exact: true }).click()
    await page.getByRole('button', { name: 'Finalizar y guardar' }).click()
    await expect(page.getByText('Corrección pendiente de validación', { exact: true })).toBeVisible()
    await expect(page.getByText(`${count} de ${count}`, { exact: true })).toBeVisible()
    expect(errors).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('home and invalid private link remain usable on mobile', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Conocerte empieza con una pregunta.' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Conocer el test/ })).toHaveCount(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Retomar un test' }).click()
  await page.getByLabel('Tu enlace o código privado').fill('invalid')
  await page.getByRole('button', { name: 'Abrir mi test' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.goto('/intento#invalid')
  await expect(page.getByRole('heading', { name: 'Falta tu enlace privado.' })).toBeVisible()
})
