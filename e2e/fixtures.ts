import type { Page, Route } from '@playwright/test'

const token = '12345678-1234-4234-8234-123456789abc'
const user = { id: '98765432-1234-4234-8234-123456789abc', email: 'profesional@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
const jwt = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.fixture`
export const recoveryHash = `#access_token=${jwt}&refresh_token=fixture_refresh&expires_in=3600&token_type=bearer&type=recovery`
export const attemptToken = token
const session = { access_token: jwt, refresh_token: 'fixture_refresh', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }
const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PUT,OPTIONS', 'content-type': 'application/json' }
async function respond(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, headers, body: JSON.stringify(body) })
}

export async function mockSupabase(page: Page) {
  let attempt = { code: 'heymans', version: 'forms-v1', status: 'in_progress', answers: {} as Record<string, string>, revision: 0, started_at: '2026-01-01T00:00:00Z', completed_at: null as string | null, result: null as null | { scores: Record<string, number>; interpretation: { status: string; message: string }; scoring_version: string } }
  await page.route('https://fixture.supabase.co/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') {
      const body = request.postDataJSON() as { email?: string; password?: string }
      return body.email === user.email && body.password === 'correct-password' || url.searchParams.get('grant_type') === 'refresh_token'
        ? respond(route, 200, session) : respond(route, 400, { code: 'invalid_credentials', message: 'Invalid login credentials' })
    }
    if (url.pathname === '/auth/v1/user') return respond(route, 200, user)
    if (url.pathname === '/auth/v1/logout') return respond(route, 200, {})
    if (url.pathname === '/auth/v1/recover') return respond(route, 200, {})
    if (url.pathname === '/rest/v1/rpc/get_attempt') return respond(route, 200, attempt)
    if (url.pathname === '/rest/v1/rpc/save_attempt') {
      const body = request.postDataJSON() as { p_answers: Record<string, string>; p_revision: number }
      if (body.p_revision !== attempt.revision) return respond(route, 400, { message: 'REVISION_CONFLICT' })
      attempt = { ...attempt, answers: body.p_answers, revision: attempt.revision + 1 }
      return respond(route, 200, attempt)
    }
    if (url.pathname === '/rest/v1/rpc/complete_attempt') {
      if (Object.keys(attempt.answers).length !== 30) return respond(route, 400, { message: 'INCOMPLETE_ANSWERS' })
      attempt = { ...attempt, status: 'completed', revision: attempt.revision + 1, completed_at: '2026-01-01T00:00:00Z', result: { scores: {}, interpretation: { status: 'pending_validation', message: 'La corrección está pendiente.' }, scoring_version: 'pending-professional-validation-v1' } }
      return respond(route, 200, attempt)
    }
    return respond(route, 404, { message: 'Not found' })
  })
}
