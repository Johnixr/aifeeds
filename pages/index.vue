<script setup lang="ts">
// Redirect to /feeds page
const router = useRouter()
onMounted(() => {
  router.push('/feeds')
})
</script>

<template>
  <div>
    <!-- Loading state or placeholder content -->
    <div class="flex items-center justify-center min-h-screen">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  </div>
</template>
