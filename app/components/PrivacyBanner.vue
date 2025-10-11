<template>
  <div
    v-if="!privacyStore.bannerDismissed"
    class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <Icon
            name="material-symbols:info-outline"
            size="24"
            class="text-primary-500 shrink-0 mt-0.5"
          />
          <p class="text-sm text-gray-700 dark:text-gray-300">
            This application does not use cookies and does not track users, but it relies on local
            storage to manage sessions and states. If you wish to delete all your data from this
            application, please contact the professor.
          </p>
        </div>
        <button
          class="shrink-0 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-sm font-medium transition-colors"
          @click="privacyStore.dismissBanner()"
        >
          Got It
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const privacyStore = usePrivacyStore()
</script>
