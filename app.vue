<template>
  <div class="min-h-screen">
    <!-- Global Modal Backdrop -->
    <Transition name="fade">
      <div 
        v-if="uiStore.showModalBackdrop" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      ></div>
    </Transition>

    <NavBar />
    <main class="container mx-auto px-4 py-6">
      <NuxtPage />
    </main>
    <footer class="bg-gray-100 py-4 mt-auto">
      <div class="container mx-auto px-4 text-center text-gray-600 text-xs sm:text-sm">
        <p>&copy; {{ new Date().getFullYear() }} AGI Hunt. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useUIStore } from '~/stores/ui'
const uiStore = useUIStore()

// 当访问首页时，默认跳转到列表页
const router = useRouter()
const route = useRoute()

onMounted(() => {
  // Theme detection
  const updateTheme = () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
    }
  }
  
  // Initial theme check
  updateTheme()

  // Watch for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme)

  // Route handling
  if (route.path === '/') {
    const today = new Date().toISOString().split('T')[0]
    const userLang = navigator.language.toLowerCase()
    let lang = 'en'
    if (userLang.startsWith('zh')) {
      lang = 'zh'
    } else if (userLang.startsWith('ja')) {
      lang = 'ja'
    }
    router.push(`/feeds/ai/${today}/${lang}`)
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
