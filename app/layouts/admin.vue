<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <nav class="bg-primary-600 dark:bg-primary-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/admin/projects" class="text-xl font-bold text-white">
                <Icon name="material-symbols:admin-panel-settings" class="mr-2" />
                Admin Panel
              </NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <ClientOnly>
                <NuxtLink
                  to="/admin/projects"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-white"
                  active-class="border-b-2 border-white"
                  inactive-class="opacity-80 hover:opacity-100"
                >
                  <Icon name="material-symbols:folder-open" class="mr-2" />
                  Projects
                </NuxtLink>
                <NuxtLink
                  v-if="roleId === roles.COORDINATOR"
                  to="/admin/groups"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-white"
                  active-class="border-b-2 border-white"
                  inactive-class="opacity-80 hover:opacity-100"
                >
                  <Icon name="material-symbols:groups" class="mr-2" />
                  Groups
                </NuxtLink>
                <NuxtLink
                  v-if="roleId === roles.ROOT || roleId === roles.PROFESSOR"
                  to="/admin/users"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-white"
                  active-class="border-b-2 border-white"
                  inactive-class="opacity-80 hover:opacity-100"
                >
                  <Icon name="material-symbols:manage-accounts" class="mr-2" />
                  Admins
                </NuxtLink>
                <NuxtLink
                  to="/admin/security-codes"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-white"
                  active-class="border-b-2 border-white"
                  inactive-class="opacity-80 hover:opacity-100"
                >
                  <Icon name="material-symbols:key" class="mr-2" />
                  Security Codes
                </NuxtLink>
                <NuxtLink
                  to="/admin/account"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-white"
                  active-class="border-b-2 border-white"
                  inactive-class="opacity-80 hover:opacity-100"
                >
                  <Icon name="material-symbols:account-circle" class="mr-2" />
                  Account
                </NuxtLink>
                <a
                  href="https://github.com/FrostWalk/Frontend/blob/main/README.md#reporting-bugs"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-white opacity-80 hover:opacity-100"
                >
                  <Icon name="material-symbols:bug-report" class="mr-2" />
                  Submit a bug
                </a>
              </ClientOnly>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <ClientOnly>
              <div class="text-white text-sm">
                <div class="font-medium">{{ user?.first_name }} {{ user?.last_name }}</div>
                <div class="text-xs opacity-80">{{ getRoleName(roleId) }}</div>
              </div>
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-red-600 transition-colors"
                @click="logout"
              >
                <Icon name="material-symbols:logout" size="18" />
                Logout
              </button>
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
const { user, roleId, logout, roles } = useAdminAuth()

const getRoleName = (id: number | null): string => {
  if (id === roles.ROOT) return 'Root'
  if (id === roles.PROFESSOR) return 'Professor'
  if (id === roles.COORDINATOR) return 'Coordinator'
  return 'Unknown'
}
</script>
