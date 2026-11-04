import { expect, test } from '@playwright/test'
import { attemptToken, mockSupabase } from './fixtures'

test.beforeEach(async ({ page }) => { await mockSupabase(page) })

test('public pages do not allow starting an unassigned test', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Conocerte empieza con una pregunta.' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Conocer el test/ })).toHaveCount(3)
  await page.goto('/tests/heymans/datos')
  await expect(page.getByRole('heading', { name: 'Tu profesional te compartirá un enlace' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Empezar|Aceptar y continuar|Probar/ })).toHaveCount(0)
  await expect(page.getByLabel('Nombre completo')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('an existing private link can resume, save and complete', async ({ page }) => {
  await page.goto(`/intento#${attemptToken}`)
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  for (let index = 0; index < 30; index++) {
    await page.getByRole('radio').nth(index % 2).check()
    await page.getByRole('button', { name: index === 29 ? 'Revisar respuestas' : 'Continuar', exact: true }).click()
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
      await page.getByRole('button', { name: 'Anterior' }).click()
      await expect(page.getByRole('radio').first()).toBeChecked()
      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    }
  }
  await expect(page.getByRole('heading', { name: 'Tu recorrido está completo.' })).toBeVisible()
  await page.getByRole('button', { name: 'Finalizar y guardar' }).click()
  await expect(page.getByText('Corrección pendiente de validación', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Corrección pendiente de validación', { exact: true })).toBeVisible()
})

test('a patient link stays intact while a professional session exists', async ({ page }) => {
  await page.goto('/ingresar')
  await page.getByLabel('Correo electrónico').fill('profesional@example.test')
  await page.getByLabel('Contraseña', { exact: true }).fill('correct-password')
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenido a porandu.' })).toBeVisible()
  await page.goto(`/intento#${attemptToken}`)
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  expect(new URL(page.url()).hash).toBe(`#${attemptToken}`)
  await expect(page.getByRole('link', { name: 'Mi panel' })).toBeVisible()
})
