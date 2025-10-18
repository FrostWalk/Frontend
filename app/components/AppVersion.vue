<template>
  <div class="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
    {{ versionText }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  version?: string
  commitHash?: string
}

const props = withDefaults(defineProps<Props>(), {
  version: '',
  commitHash: ''
})

const config = useRuntimeConfig()

const version = computed(() => props.version || config.public.appVersion || '')
const commitHash = computed(() => props.commitHash || config.public.appCommitHash || '')

const versionText = computed(() => {
  if (version.value && commitHash.value) {
    return `${version.value} (${commitHash.value})`
  } else if (commitHash.value) {
    return `(${commitHash.value})`
  } else if (version.value) {
    return version.value
  }
  return 'Development Version'
})
</script>
