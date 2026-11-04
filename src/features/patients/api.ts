import { getSupabase } from '@/lib/supabase'
import { patientSchema, type PatientInput } from '@/features/patients/schema'
import { createDemoAttempt, friendlyError } from '@/features/tests/api'
import { isDemo } from '@/lib/config'
import { tokenSchema } from '@/features/tests/schema'

export async function startTest(code: string, version: string, input: PatientInput) {
  const parsed = patientSchema.parse(input)
  if (isDemo) return createDemoAttempt(code, version)
  const { consent, ...patient } = parsed
  const { data, error } = await getSupabase().rpc('start_test', {
    p_code: code, p_version: version, p_patient: patient, p_consent: consent,
  })
  if (error) throw new Error(friendlyError(error))
  return tokenSchema.parse(data)
}
