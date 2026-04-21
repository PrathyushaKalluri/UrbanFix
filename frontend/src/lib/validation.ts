import { z } from 'zod'

// Base email validation
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Base password validation
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Full name validation
const fullNameSchema = z
  .string()
  .min(1, 'Full name is required')
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Signup form schema
export const signupSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
})

// Types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

// Helper function to get field errors
export function getFieldErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Record<string, string> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return {}
  }
  
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string
    if (!errors[field]) {
      errors[field] = issue.message
    }
  })
  
  return errors
}

// Validate single field
export function validateField<T>(
  schema: z.ZodSchema<T>,
  field: keyof T,
  value: unknown
): string | null {
  const partialSchema = z.object({
    [field]: (schema as z.ZodObject<any>).shape[field],
  })
  
  const result = partialSchema.safeParse({ [field]: value })
  
  if (result.success) {
    return null
  }
  
  return result.error.issues[0]?.message || null
}
