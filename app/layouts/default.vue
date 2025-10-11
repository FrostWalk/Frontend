<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/projects" class="text-xl font-bold text-gray-900 dark:text-white">
                Ferris Store
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
            <UDropdown :items="userMenuItems">
              <UButton
                color="neutral"
                :label="user?.first_name || 'User'"
                trailing-icon="material-symbols:arrow-drop-down"
              >
                <template #leading>
                  <Icon name="material-symbols:account-circle" size="20" />
                </template>
              </UButton>
            </UDropdown>
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
          © 2025 Ferris Store. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useStudentAuth()

const userMenuItems = [
  [
    {
      label: user.value?.email || '',
      slot: 'account',
      disabled: true
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'material-symbols:logout',
      click: logout
    }
  ]
]
</script>
