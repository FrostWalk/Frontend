import { defineStore } from 'pinia'
import type { LoginAdminsSchema, AdminResponseScheme } from '~/composables/api/types.gen'
import { adminsLoginHandler, adminsMeHandler } from '~/composables/api/sdk.gen'

interface AdminAuthState {
  token: string | null
  user: AdminResponseScheme | null
  isAuthenticated: boolean
  roleId: number | null
}

export const useAdminAuthStore = defineStore('adminAuth', {
  state: (): AdminAuthState => ({
    token: null,
    user: null,
    isAuthenticated: false,
    roleId: null
  }),

  getters: {
    getToken: (state) => state.token,
    getUser: (state) => state.user,
    getRoleId: (state) => state.roleId,
    isLoggedIn: (state) => state.isAuthenticated,

    roles: () => ({
      ROOT: 1,
      PROFESSOR: 2,
      COORDINATOR: 3
    })
  },

  actions: {
    // Initialize from localStorage
    init() {
      if (import.meta.client && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('admin_token')
        const userStr = localStorage.getItem('admin_user')

        if (token && userStr) {
          const user = JSON.parse(userStr)
          this.token = token
          this.user = user
          this.isAuthenticated = true
          this.roleId = user.role_id
        }
      }
    },

    // Login action
    async login(credentials: LoginAdminsSchema) {
      const { data, error } = await adminsLoginHandler({
        body: credentials
      })

      if (error) {
        throw error
      }

      if (data) {
        const token = data.token

        // Save token to localStorage AND Pinia state FIRST
        if (import.meta.client && typeof localStorage !== 'undefined') {
          localStorage.setItem('admin_token', token)
        }
        this.token = token
        this.isAuthenticated = true

        // Fetch user data (token is now available in interceptor)
        const { data: userData, error: userError } = await adminsMeHandler()

        if (userError || !userData) {
          throw new Error('Failed to fetch user data')
        }

        // Save user to localStorage and update state
        if (import.meta.client && typeof localStorage !== 'undefined') {
          localStorage.setItem('admin_user', JSON.stringify(userData))
        }
        this.user = userData
        this.roleId = userData.role_id
      }
    },

    // Logout action
    logout() {
      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }

      this.token = null
      this.user = null
      this.isAuthenticated = false
      this.roleId = null

      navigateTo('/admin/login')
    },

    // Check if user has a specific role
    hasRole(roleId: number): boolean {
      return this.roleId === roleId
    }
  }
})
