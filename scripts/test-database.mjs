import assert from 'node:assert/strict'
import { createTestDatabase } from './database-runtime.mjs'

const db = await createTestDatabase()
let checks = 0
async function rejected(sql, params, message) {
  await assert.rejects(db.query(sql, params), (error) => error.message.includes(message))
  checks++
}
try {
  const { rows: rls } = await db.query(`select relname, relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'`)
  assert.equal(rls.length, 5)
  assert.ok(rls.every((table) => table.relrowsecurity)); checks++
  await db.exec('set role anon')
  for (const table of ['patients', 'professionals', 'tests', 'test_attempts', 'test_results']) {
    await rejected(`select * from public.${table}`, [], 'permission denied')
    await rejected(`delete from public.${table}`, [], 'permission denied')
  }
  await rejected(`select public.validate_answers('eysenck',57,'{}'::jsonb,false)`, [], 'permission denied')
  await rejected(`select public.start_test('eysenck','forms-v1',$1::jsonb,false)`, [JSON.stringify({ full_name: 'Fictitious test person' })], 'CONSENT_REQUIRED')
  await rejected(`select public.start_test('eysenck','forms-v1','{"full_name":"X"}'::jsonb,true)`, [], 'INVALID_NAME')
  await rejected(`select public.start_test('eysenck','forms-v1','{"full_name":"Test","email":"invalid"}'::jsonb,true)`, [], 'INVALID_EMAIL')
  await rejected(`select public.start_test('eysenck','forms-v1','{"full_name":"Test","birth_date":"2999-01-01"}'::jsonb,true)`, [], 'INVALID_BIRTH_DATE')
  await rejected(`select public.start_test('scl90','forms-v1','{"full_name":"Test"}'::jsonb,true)`, [], 'UNKNOWN_TEST_VERSION')
  await rejected(`select public.get_attempt('00000000-0000-4000-8000-000000000000')`, [], 'ATTEMPT_NOT_FOUND')
  for (const [code, count, values] of [['heymans', 30, ['X', 'Z']], ['chaside', 98, ['SI', 'NO']], ['eysenck', 57, ['SI', 'NO']]]) {
    const { rows: [{ token }] } = await db.query(`select public.start_test($1,'forms-v1',$2::jsonb,true) as token`, [code, JSON.stringify({ full_name: 'Fictitious test person' })])
    assert.match(token, /^[a-f0-9-]{36}$/); checks++
    const { rows: [{ snapshot }] } = await db.query('select public.get_attempt($1) as snapshot', [token])
    assert.equal(snapshot.status, 'in_progress')
    assert.equal(snapshot.revision, 0)
    assert.equal(snapshot.full_name, undefined)
    assert.equal(snapshot.patient_id, undefined); checks++
    await rejected('select public.complete_attempt($1,0)', [token], 'INCOMPLETE_ANSWERS')
    await rejected('select public.save_attempt($1,$2::jsonb,0)', [token, JSON.stringify({ 1: 'MAYBE' })], 'INVALID_ANSWER')
    await rejected('select public.save_attempt($1,$2::jsonb,0)', [token, JSON.stringify({ '01': values[0] })], 'INVALID_ITEM')
    await rejected('select public.save_attempt($1,$2::jsonb,0)', [token, JSON.stringify({ [count + 1]: values[0] })], 'INVALID_ANSWER')
    await rejected('select public.save_attempt($1,$2::jsonb,0)', [token, JSON.stringify({ 1: null })], 'INVALID_ANSWER')
    const partial = JSON.stringify({ 1: values[0] })
    await db.query('select public.save_attempt($1,$2::jsonb,0)', [token, partial]); checks++
    await rejected('select public.save_attempt($1,$2::jsonb,0)', [token, partial], 'REVISION_CONFLICT')
    const answers = Object.fromEntries(Array.from({ length: count }, (_, i) => [String(i + 1), values[i % 2]]))
    await db.query('select public.save_attempt($1,$2::jsonb,1)', [token, JSON.stringify(answers)]); checks++
    await rejected('select public.complete_attempt($1,1)', [token], 'REVISION_CONFLICT')
    const { rows: [{ result }] } = await db.query('select public.complete_attempt($1,2) as result', [token])
    assert.equal(result.status, 'completed')
    assert.deepEqual(result.answers, answers)
    assert.deepEqual(result.result.scores, {})
    assert.equal(result.result.interpretation.status, 'pending_validation'); checks++
    const { rows: [{ duplicate }] } = await db.query('select public.complete_attempt($1,2) as duplicate', [token])
    assert.deepEqual(duplicate, result); checks++
    await rejected('select public.save_attempt($1,$2::jsonb,3)', [token, partial], 'ATTEMPT_COMPLETED')
  }
  await db.exec('reset role')
  const { rows: [{ total }] } = await db.query('select count(*)::int as total from public.test_results')
  assert.equal(total, 3); checks++
  await db.exec('set role authenticated')
  await rejected('select * from public.patients', [], 'permission denied')
  console.log(`Database integration: ${checks} assertions passed (RLS, grants, validation, progress, revisions, completion, idempotency).`)
} finally { await db.close() }
