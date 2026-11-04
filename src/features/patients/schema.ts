import { z } from 'zod'

const optionalString = (max: number) => z.string().trim().max(max)
export const patientSchema = z.object({
  full_name: z.string().trim().min(2, 'Ingresá tu nombre completo.').max(160, 'Usá hasta 160 caracteres.'),
  email: z.union([z.literal(''), z.email('Ingresá un correo válido.').max(254)]),
  document_number: optionalString(40),
  phone: optionalString(40),
  sex: z.enum(['', 'female', 'male', 'other', 'prefer_not_to_say']),
  birth_date: z.string().refine((value) => {
    if (!value) return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00`)
    return !Number.isNaN(date.getTime()) && date.getFullYear() >= 1900 && date <= new Date()
      && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10))
  }, 'Ingresá una fecha de nacimiento válida.'),
  consent: z.literal(true, { error: 'Necesitamos tu consentimiento para continuar.' }),
})
export type PatientInput = z.infer<typeof patientSchema>
