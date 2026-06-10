export interface ValidationRules {
  required?: boolean
  email?: boolean
  minLength?: number
  maxLength?: number
  phone?: boolean
}

export interface ValidationError {
  [key: string]: string | null
}

export const useValidation = () => {
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 10
  }

  const validateRequired = (field: string): boolean => {
    return !!(field && field.trim().length > 0)
  }

  const validateField = (
    value: string,
    rules: ValidationRules
  ): string | null => {
    if (rules.required && !validateRequired(value)) {
      return 'Este campo es requerido'
    }

    if (rules.email && value && !validateEmail(value)) {
      return 'Formato de email inválido'
    }

    if (rules.phone && value && !validatePhone(value)) {
      return 'Teléfono debe tener 10+ dígitos'
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`
    }

    return null
  }

  const validateForm = (
    formData: Record<string, string>,
    schema: Record<string, ValidationRules>
  ): { isValid: boolean; errors: ValidationError } => {
    const errors: ValidationError = {}
    let isValid = true

    for (const [field, rules] of Object.entries(schema)) {
      const error = validateField(formData[field] || '', rules)
      if (error) {
        errors[field] = error
        isValid = false
      } else {
        errors[field] = null
      }
    }

    return { isValid, errors }
  }

  return {
    validateEmail,
    validatePhone,
    validateRequired,
    validateField,
    validateForm,
  }
}
