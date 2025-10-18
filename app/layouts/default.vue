<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
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
              <button
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                @click="navigateToMyGroup"
              >
                <Icon name="material-symbols:groups" class="mr-2" />
                My Group
              </button>
              <NuxtLink
                to="/groups/create"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                active-class="border-b-2 border-primary-500 text-gray-900 dark:text-white"
                inactive-class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <Icon name="material-symbols:group-add" class="mr-2" />
                Create Group
              </NuxtLink>
              <a
                href="https://github.com/FrostWalk/Frontend/blob/main/README.md#reporting-bugs"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <Icon name="material-symbols:bug-report" class="mr-2" />
                Submit a bug
              </a>
            </div>
          </div>
          <div class="flex items-center">
            <ClientOnly>
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
                  class="absolute right-0 mt-2 min-w-56 w-max rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <div
                      class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                    >
                      {{ user?.email || '' }}
                    </div>
                    <NuxtLink
                      to="/account"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      @click="isDropdownOpen = false"
                    >
                      <Icon name="material-symbols:account-circle" size="18" />
                      Account Settings
                    </NuxtLink>
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
            </ClientOnly>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>

    <footer class="mt-auto">
      <AppVersion />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { getGroups } from '~/composables/api/sdk.gen'

const { user, logout } = useStudentAuth()
const { showError } = useErrorToast()

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const handleLogout = () => {
  isDropdownOpen.value = false
  logout()
}

const navigateToMyGroup = async () => {
  try {
    const { data, error } = await getGroups()

    if (error) {
      showError('Error', error)
      return
    }

    if (data && data.groups && data.groups.length > 0) {
      // Navigate to the first group the user is part of
      const firstGroup = data.groups[0]
      if (firstGroup?.group?.group_id) {
        navigateTo(`/groups/${firstGroup.group.group_id}`)
      } else {
        navigateTo('/groups/create')
      }
    } else {
      // No group found, redirect to create group
      navigateTo('/groups/create')
    }
  } catch (err) {
    showError('Error', err)
  }
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
