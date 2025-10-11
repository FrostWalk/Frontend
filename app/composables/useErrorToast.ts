interface ApiError {
  error?: string
  log_id?: string
}

export const useErrorToast = () => {
  const toast = useToast()

  const showError = (title: string, error: unknown) => {
    let description = 'An unexpected error occurred'
    let logId = ''

    // Check if it's an API error with error and log_id
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = error as ApiError
      description = apiError.error || description
      logId = apiError.log_id || ''
    } else if (error instanceof Error) {
      description = error.message
    } else if (typeof error === 'string') {
      description = error
    }

    // Format description with log_id if available
    const fullDescription = logId ? `${description}\nError ID: ${logId}` : description

    toast.add({
      title,
      description: fullDescription,
      color: 'error',
      duration: 4000
    })
  }

  return {
    showError
  }
}
