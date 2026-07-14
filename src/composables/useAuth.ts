import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.checkAuth())
  const admin = computed(() => authStore.admin)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  const login = (email: string, password: string) => {
    return authStore.login(email, password)
  }

  const logout = () => {
    authStore.logout()
  }

  const getAuthHeaders = () => {
    if (!authStore.token) return {}
    return {
      Authorization: `Bearer ${authStore.token}`,
    }
  }

  return {
    isAuthenticated,
    admin,
    isLoading,
    error,
    login,
    logout,
    getAuthHeaders,
  }
}
