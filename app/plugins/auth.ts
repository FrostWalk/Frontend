export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const studentAuthStore = useStudentAuthStore()
    const adminAuthStore = useAdminAuthStore()

    // Initialize stores from localStorage
    studentAuthStore.init()
    adminAuthStore.init()
  }
})
