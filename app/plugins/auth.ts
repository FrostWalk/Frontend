export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const studentAuthStore = useStudentAuthStore()
    const adminAuthStore = useAdminAuthStore()
    const privacyStore = usePrivacyStore()

    // Initialize stores from localStorage
    studentAuthStore.init()
    adminAuthStore.init()
    privacyStore.init()
  }
})
