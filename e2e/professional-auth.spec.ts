import { expect, test } from '@playwright/test'
import { mockSupabase, recoveryHash } from './fixtures'

test.beforeEach(async ({ page }) => { await mockSupabase(page) })

test('protected panel, login, persistence, logout and invalid credentials', async ({ page }) => {
  await page.goto('/profesional')
  await expect(page).toHaveURL(/\/ingresar$/)
  await page.getByLabel('Correo electrónico').fill('profesional@example.test')
  await page.getByLabel('Contraseña', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Revisá tu correo y contraseña')
  await page.getByLabel('Contraseña', { exact: true }).fill('correct-password')
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenido a porandu.' })).toBeVisible()
  await expect(page.getByText('profesional@example.test')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bienvenido a porandu.' })).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/ingresar$/)
  await page.goto('/profesional')
  await expect(page).toHaveURL(/\/ingresar$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('password recovery request is neutral and rejects an expired link', async ({ page }) => {
  await page.goto('/ingresar')
  await page.getByRole('link', { name: 'Olvidé mi contraseña' }).click()
  await page.getByLabel('Correo electrónico').fill('nadie@example.test')
  await page.getByRole('button', { name: 'Enviar enlace' }).click()
  await expect(page.getByRole('status')).toContainText('Si existe una cuenta')
  await page.goto('/recuperar/actualizar#error=access_denied&error_code=otp_expired')
  await expect(page.getByRole('alert')).toContainText('no es válido o venció')
  await expect(page.getByLabel('Nueva contraseña')).toHaveCount(0)
})

test('valid recovery link permits matching new password', async ({ page }) => {
  await page.goto(`/recuperar/actualizar${recoveryHash}`)
  await expect(page.getByLabel('Nueva contraseña')).toBeVisible()
  await page.getByLabel('Nueva contraseña').fill('new-password-123')
  await page.getByLabel('Repetir contraseña').fill('different-password')
  await page.getByRole('button', { name: 'Guardar contraseña' }).click()
  await expect(page.getByRole('alert')).toContainText('no coinciden')
  await page.getByLabel('Repetir contraseña').fill('new-password-123')
  await page.getByRole('button', { name: 'Guardar contraseña' }).click()
  await expect(page.getByRole('status')).toContainText('Tu contraseña se actualizó.')
  await page.getByRole('link', { name: 'Ir a mi panel' }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenido a porandu.' })).toBeVisible()
})
