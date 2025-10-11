export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { isAuthenticated, init } = useStudentAuth()

  // Initialize auth state from localStorage
  init()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
