import { client } from '~/composables/api/client.gen'

export default defineNuxtPlugin(() => {
  // Set the base URL from runtime config
  const config = useRuntimeConfig()
  client.setConfig({
    baseUrl: config.public.apiBaseUrl
  })

  // Request interceptor to inject JWT tokens
  client.interceptors.request.use((request) => {
    if (!import.meta.client) {
      return request
    }

    const url = request.url || ''

    if (url.includes('/v1/students/')) {
      const token = localStorage.getItem('student_token')
      if (token) {
        request.headers.set('X-Student-Token', token)
      }
    } else if (url.includes('/v1/admins/')) {
      const token = localStorage.getItem('admin_token')
      if (token) {
        request.headers.set('X-Admin-Token', token)
      }
    }

    return request
  })

  // Response interceptor to handle 401 errors
  client.interceptors.response.use((response, request) => {
    if (response.status === 401 && import.meta.client) {
      const url = request.url || ''

      if (url.includes('/v1/students/')) {
        localStorage.removeItem('student_token')
        localStorage.removeItem('student_user')
        navigateTo('/login')
      } else if (url.includes('/v1/admins/')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        navigateTo('/admin/login')
      }
    }

    return response
  })
})
