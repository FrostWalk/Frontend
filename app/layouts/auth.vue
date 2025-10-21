<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full flex-1 flex flex-col justify-center">
      <slot />
    </div>

    <footer class="mt-auto">
      <AppVersion />
    </footer>
  </div>
</template>
