import type {
  LoginStudentsSchema,
  GetMeStudentResponse,
  LoginAdminsSchema,
  AdminResponseScheme
} from '~/composables/api/types.gen'
import {
  studentsLoginHandler,
  studentsMeHandler,
  adminsLoginHandler,
  adminsMeHandler
} from '~/composables/api/sdk.gen'

export interface StudentAuthState {
  token: string | null
  user: GetMeStudentResponse | null
  isAuthenticated: boolean
}

export interface AdminAuthState {
  token: string | null
  user: AdminResponseScheme | null
  isAuthenticated: boolean
  roleId: number | null
}

// Student Authentication
export const useStudentAuth = () => {
  const authState = useState<StudentAuthState>('student-auth', () => ({
    token: null,
    user: null,
    isAuthenticated: false
  }))

  // Initialize from localStorage on mount
  const init = () => {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('student_token')
      const userStr = localStorage.getItem('student_user')

      if (token && userStr) {
        authState.value = {
          token,
          user: JSON.parse(userStr),
          isAuthenticated: true
        }
      }
    }
  }

  const login = async (credentials: LoginStudentsSchema): Promise<void> => {
    const { data, error } = await studentsLoginHandler({
      body: credentials
    })

    if (error) {
      throw new Error(error.error || 'Login failed')
    }

    if (data) {
      const token = data.token
      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.setItem('student_token', token)
      }

      // Fetch user data
      const { data: userData, error: userError } = await studentsMeHandler()

      if (userError || !userData) {
        throw new Error('Failed to fetch user data')
      }

      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.setItem('student_user', JSON.stringify(userData))
      }

      authState.value = {
        token,
        user: userData,
        isAuthenticated: true
      }
    }
  }

  const logout = () => {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      localStorage.removeItem('student_token')
      localStorage.removeItem('student_user')
    }
    authState.value = {
      token: null,
      user: null,
      isAuthenticated: false
    }
    navigateTo('/login')
  }

  return {
    token: computed(() => authState.value.token),
    user: computed(() => authState.value.user),
    isAuthenticated: computed(() => authState.value.isAuthenticated),
    login,
    logout,
    init
  }
}

// Admin Authentication
export const useAdminAuth = () => {
  const authState = useState<AdminAuthState>('admin-auth', () => ({
    token: null,
    user: null,
    isAuthenticated: false,
    roleId: null
  }))

  // Initialize from localStorage on mount
  const init = () => {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      const userStr = localStorage.getItem('admin_user')

      if (token && userStr) {
        const user = JSON.parse(userStr)
        authState.value = {
          token,
          user,
          isAuthenticated: true,
          roleId: user.role_id
        }
      }
    }
  }

  const login = async (credentials: LoginAdminsSchema): Promise<void> => {
    const { data, error } = await adminsLoginHandler({
      body: credentials
    })

    if (error) {
      throw new Error(error.error || 'Login failed')
    }

    if (data) {
      const token = data.token
      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.setItem('admin_token', token)
      }

      // Fetch user data
      const { data: userData, error: userError } = await adminsMeHandler()

      if (userError || !userData) {
        throw new Error('Failed to fetch user data')
      }

      if (import.meta.client && typeof localStorage !== 'undefined') {
        localStorage.setItem('admin_user', JSON.stringify(userData))
      }

      authState.value = {
        token,
        user: userData,
        isAuthenticated: true,
        roleId: userData.role_id
      }
    }
  }

  const logout = () => {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
    authState.value = {
      token: null,
      user: null,
      isAuthenticated: false,
      roleId: null
    }
    navigateTo('/admin/login')
  }

  // Check if user has a specific role
  const hasRole = (roleId: number): boolean => {
    return authState.value.roleId === roleId
  }

  // Role constants for easy reference
  const roles = {
    ROOT: 1,
    PROFESSOR: 2,
    COORDINATOR: 3
  }

  return {
    token: computed(() => authState.value.token),
    user: computed(() => authState.value.user),
    isAuthenticated: computed(() => authState.value.isAuthenticated),
    roleId: computed(() => authState.value.roleId),
    login,
    logout,
    init,
    hasRole,
    roles
  }
}
