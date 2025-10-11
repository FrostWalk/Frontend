<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Redirecting...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

onMounted(() => {
  navigateTo('/admin/projects')
})
</script>
