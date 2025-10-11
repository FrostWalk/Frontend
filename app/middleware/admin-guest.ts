import { adminsMeHandler } from '~/composables/api/sdk.gen'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const adminAuthStore = useAdminAuthStore()

  // Initialize from localStorage
  adminAuthStore.init()

  // If user has a token, verify it's valid
  if (adminAuthStore.isAuthenticated && adminAuthStore.token) {
    try {
      const { data, error } = await adminsMeHandler()

      if (data && !error) {
        // Token is valid, redirect to admin projects page
        return navigateTo('/admin/projects')
      } else {
        // Token is invalid, clear auth state
        adminAuthStore.logout()
      }
    } catch {
      // Token is invalid or network error, clear auth state
      adminAuthStore.logout()
    }
  }
})
