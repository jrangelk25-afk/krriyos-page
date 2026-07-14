import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

interface AdminUser {
  id: string
  email: string
  fullName: string
  role: 'ADMIN' | 'STAFF'
}

interface JWTPayload {
  id: string
  email: string
  role: string
  iat: number
  exp: number
}

const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp > currentTime
  } catch {
    return false
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const admin = ref<AdminUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    return isTokenValid(token.value)
  })

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al iniciar sesión')
      }

      const data = await response.json()

      // Guardar token
      token.value = data.token
      localStorage.setItem('auth_token', data.token)

      // Decodificar y guardar admin data
      const decoded = jwtDecode<JWTPayload>(data.token)
      admin.value = {
        id: decoded.id,
        email: decoded.email,
        fullName: data.admin.fullName,
        role: (decoded.role as 'ADMIN' | 'STAFF') || 'STAFF',
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    admin.value = null
    localStorage.removeItem('auth_token')
  }

  const checkAuth = (): boolean => {
    if (!token.value) {
      // Intentar recuperar del localStorage
      const storedToken = localStorage.getItem('auth_token')
      if (!storedToken) return false

      token.value = storedToken

      if (!isTokenValid(storedToken)) {
        logout()
        return false
      }

      // Decodificar token guardado
      try {
        const decoded = jwtDecode<JWTPayload>(storedToken)
        admin.value = {
          id: decoded.id,
          email: decoded.email,
          fullName: decoded.email.split('@')[0],
          role: (decoded.role as 'ADMIN' | 'STAFF') || 'STAFF',
        }
      } catch {
        logout()
        return false
      }

      return true
    }

    if (!isTokenValid(token.value)) {
      logout()
      return false
    }

    return true
  }

  return {
    token,
    admin,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
})
