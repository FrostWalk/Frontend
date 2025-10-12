<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/projects" class="text-xl font-bold text-gray-900 dark:text-white">
                Advanced programming
              </NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                to="/projects"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                active-class="border-b-2 border-primary-500 text-gray-900 dark:text-white"
                inactive-class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <Icon name="material-symbols:folder-open" class="mr-2" />
                Projects
              </NuxtLink>
              <NuxtLink
                to="/groups/create"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                active-class="border-b-2 border-primary-500 text-gray-900 dark:text-white"
                inactive-class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <Icon name="material-symbols:group-add" class="mr-2" />
                Create Group
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center">
            <div ref="dropdownRef" class="relative">
              <button
                class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="isDropdownOpen = !isDropdownOpen"
              >
                <Icon name="material-symbols:account-circle" size="20" />
                {{ user?.first_name || 'User' }}
                <Icon name="material-symbols:arrow-drop-down" size="20" />
              </button>

              <div
                v-if="isDropdownOpen"
                class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="py-1">
                  <div
                    class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"
                  >
                    {{ user?.email || '' }}
                  </div>
                  <button
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    @click="handleLogout"
                  >
                    <Icon name="material-symbols:logout" size="18" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>

    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 Advanced programming. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useStudentAuth()

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const handleLogout = () => {
  isDropdownOpen.value = false
  logout()
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isDropdownOpen.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
