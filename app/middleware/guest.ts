import { studentsMeHandler } from '~/composables/api/sdk.gen'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const studentAuthStore = useStudentAuthStore()

  // Initialize from localStorage
  studentAuthStore.init()

  // If user has a token, verify it's valid
  if (studentAuthStore.isAuthenticated && studentAuthStore.token) {
    try {
      const { data, error } = await studentsMeHandler()

      if (data && !error) {
        // Token is valid, redirect to projects page
        return navigateTo('/projects')
      } else {
        // Token is invalid, clear auth state
        studentAuthStore.logout()
      }
    } catch {
      // Token is invalid or network error, clear auth state
      studentAuthStore.logout()
    }
  }
})
