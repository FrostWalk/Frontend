// Wrapper composables for backward compatibility with existing code
// These now use Pinia stores under the hood

import { useStudentAuthStore } from '~/stores/studentAuth'
import { useAdminAuthStore } from '~/stores/adminAuth'

export const useStudentAuth = () => {
  const store = useStudentAuthStore()

  return {
    token: computed(() => store.token),
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    login: store.login,
    logout: store.logout,
    init: store.init
  }
}

export const useAdminAuth = () => {
  const store = useAdminAuthStore()

  return {
    token: computed(() => store.token),
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    roleId: computed(() => store.roleId),
    login: store.login,
    logout: store.logout,
    init: store.init,
    hasRole: store.hasRole,
    roles: store.roles
  }
}
