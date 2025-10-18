<template>
  <div class="max-w-2xl mx-auto">
    <div class="text-center py-12">
      <Icon name="material-symbols:info" size="64" class="mx-auto text-blue-500 mb-6" />
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Deliverable Selection Moved
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        The deliverable selection functionality has been integrated into the main group page for a
        better user experience.
      </p>

      <div class="space-y-4">
        <UButton color="primary" size="lg" @click="navigateToGroup">
          <Icon name="material-symbols:arrow-back" class="mr-2" />
          Go to Group Page
        </UButton>

        <div class="text-sm text-gray-500 dark:text-gray-400">
          You'll be able to select deliverables and manage component details from there.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  key: (route) => `group-${route.params.id}-select-deliverable`
})

const route = useRoute()

const navigateToGroup = () => {
  const groupId = route.params.id as string
  navigateTo(`/groups/${groupId}`)
}
</script>
