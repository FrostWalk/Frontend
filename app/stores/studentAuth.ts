import { defineStore } from 'pinia'
import type { LoginStudentsSchema, GetMeStudentResponse } from '~/composables/api/types.gen'
import { studentsLoginHandler, studentsMeHandler } from '~/composables/api/sdk.gen'

interface StudentAuthState {
  token: string | null
  user: GetMeStudentResponse | null
  isAuthenticated: boolean
}

export const useStudentAuthStore = defineStore('studentAuth', {
  state: (): StudentAuthState => ({
    token: null,
    user: null,
    isAuthenticated: false
  }),

  getters: {
    getToken: (state) => state.token,
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    // Initialize from localStorage
    init() {
      if (import.meta.client && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('student_token')
        const userStr = localStorage.getItem('student_user')

        if (token && userStr) {
          this.token = token
          this.user = JSON.parse(userStr)
          this.isAuthenticated = true
        }
      }
    },

    // Login action
    async login(credentials: LoginStudentsSchema) {
      const { data, error } = await studentsLoginHandler({
        body: credentials
      })

      if (error) {
        throw error
      }

      if (data) {
        const token = data.token

        // Save token to localStorage AND Pinia state FIRST
        if (import.meta.client && typeof localStorage !== 'undefined') {
          localStorage.setItem('student_token', token)
        }
        this.token = token
        this.isAuthenticated = true

        // Fetch user data (token is now available in interceptor)
        const { data: userData, error: userError } = await studentsMeHandler()

        if (userError || !userData) {
          throw new Error('Failed to fetch user data')
        }

        // Save user to localStorage and update state
        if (import.meta.client && typeof localStorage !== 'undefined') {
          localStorage.setItem('student_user', JSON.stringify(userData))
        }
        this.user = userData
      }
    },

    // Logout action
    logout() {
      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.removeItem('student_token')
        localStorage.removeItem('student_user')
      }

      this.token = null
      this.user = null
      this.isAuthenticated = false

      navigateTo('/login')
    }
  }
})
