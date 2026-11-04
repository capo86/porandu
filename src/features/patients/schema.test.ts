import { describe, expect, it } from 'vitest'
import { patientSchema } from '@/features/patients/schema'

const fictitious = { full_name: 'Persona ficticia', email: '', phone: '', document_number: '', birth_date: '', sex: '', consent: true }
describe('patient consent and validation', () => {
  it('accepts minimal data without collecting optional fields', () => expect(patientSchema.safeParse(fictitious).success).toBe(true))
  it('requires explicit consent', () => expect(patientSchema.safeParse({ ...fictitious, consent: false }).success).toBe(false))
  it('rejects invalid email', () => expect(patientSchema.safeParse({ ...fictitious, email: 'wrong' }).success).toBe(false))
  it('rejects future dates', () => expect(patientSchema.safeParse({ ...fictitious, birth_date: '2999-01-01' }).success).toBe(false))
  it('rejects impossible dates', () => expect(patientSchema.safeParse({ ...fictitious, birth_date: '2001-02-31' }).success).toBe(false))
})
