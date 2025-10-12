<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

// Immediately redirect on the server and client
await navigateTo('/admin/projects', { replace: true, redirectCode: 301 })
</script>
