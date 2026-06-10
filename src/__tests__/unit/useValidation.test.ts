import { describe, it, expect } from 'vitest'
import { useValidation } from '../../composables/useValidation'

describe('useValidation composable', () => {
  const { validateEmail, validatePhone, validateRequired, validateForm, validateField } = useValidation()

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('a@b.c')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('test')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should accept 10+ digit phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true)
      expect(validatePhone('+1 (555) 123-4567')).toBe(true)
      expect(validatePhone('555.123.4567')).toBe(true)
    })

    it('should reject less than 10 digits', () => {
      expect(validatePhone('123456789')).toBe(false)
      expect(validatePhone('1234567')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('should accept non-empty strings', () => {
      expect(validateRequired('test')).toBe(true)
      expect(validateRequired('a')).toBe(true)
      expect(validateRequired('test value')).toBe(true)
    })

    it('should reject empty or whitespace strings', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired('\t\n')).toBe(false)
    })
  })

  describe('validateField', () => {
    it('should validate required fields', () => {
      const result = validateField('', { required: true })
      expect(result).toBe('Este campo es requerido')
    })

    it('should validate email format', () => {
      const result = validateField('invalid', { email: true })
      expect(result).toBe('Formato de email inválido')
    })

    it('should validate phone format', () => {
      const result = validateField('123', { phone: true })
      expect(result).toBe('Teléfono debe tener 10+ dígitos')
    })

    it('should validate minLength', () => {
      const result = validateField('ab', { minLength: 5 })
      expect(result).toContain('Mínimo')
    })

    it('should validate maxLength', () => {
      const result = validateField('abcdefghij', { maxLength: 5 })
      expect(result).toContain('Máximo')
    })

    it('should return null for valid values', () => {
      expect(validateField('test', { required: true })).toBeNull()
      expect(validateField('test@example.com', { email: true })).toBeNull()
      expect(validateField('1234567890', { phone: true })).toBeNull()
    })
  })

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const formData = {
        nombre: '',
        email: 'invalid',
        telefono: '123'
      }
      const schema = {
        nombre: { required: true },
        email: { email: true },
        telefono: { phone: true }
      }
      const { isValid, errors } = validateForm(formData, schema)
      expect(isValid).toBe(false)
      expect(errors.nombre).toBeTruthy()
      expect(errors.email).toBeTruthy()
      expect(errors.telefono).toBeTruthy()
    })

    it('should return valid for correct form data', () => {
      const formData = {
        nombre: 'John Doe',
        email: 'john@example.com',
        telefono: '1234567890'
      }
      const schema = {
        nombre: { required: true },
        email: { email: true },
        telefono: { phone: true }
      }
      const { isValid, errors } = validateForm(formData, schema)
      expect(isValid).toBe(true)
      expect(errors.nombre).toBeNull()
      expect(errors.email).toBeNull()
      expect(errors.telefono).toBeNull()
    })
  })
})
