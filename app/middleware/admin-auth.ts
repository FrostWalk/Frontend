export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { isAuthenticated, init } = useAdminAuth()

  // Initialize auth state from localStorage
  init()

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login', { replace: true })
  }
})
