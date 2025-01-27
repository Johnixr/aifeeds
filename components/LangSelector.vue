<template>
  <div class="relative lang-selector">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-0.5 md:space-x-2 px-1.5 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-100 text-xs md:text-base whitespace-nowrap"
    >
      <span>{{ languageLabels[selectedLang] || 'Select Language' }}</span>
      <span class="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-400 flex items-center justify-center leading-none" aria-hidden="true">⌄</span>
    </button>

    <div
      v-if="showDropdown"
      class="absolute top-full mt-1 md:mt-2 bg-white rounded-lg shadow-lg py-1 md:py-2 w-32 md:w-48"
    >
      <button
        v-for="(label, lang) in languageLabels"
        :key="lang"
        @click="selectLanguage(lang, $event)"
        class="w-full px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
        :class="{ 'bg-gray-50': lang === selectedLang }"
      >
        <span>{{ label }}</span>
        <Icon v-if="lang === selectedLang" name="mdi:check" class="w-5 h-5 text-primary" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useDropdownStore } from '~/stores/dropdown'

const route = useRoute()
const router = useRouter()
const dropdownStore = useDropdownStore()

// 组件ID
const DROPDOWN_ID = 'lang-selector'

// 检查是否显示下拉菜单
const showDropdown = computed(() => dropdownStore.activeDropdown === DROPDOWN_ID)

const languageLabels = {
  'en': 'English',
  'zh': '中文',
  'ja': '日本語'
}

// 获取当前选中的语言
const selectedLang = computed(() => route.params.language || 'en')

// 切换下拉框
const toggleDropdown = (event) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  if (dropdownStore.activeDropdown === DROPDOWN_ID) {
    dropdownStore.closeAll()
  } else {
    dropdownStore.setActiveDropdown(DROPDOWN_ID)
  }
}

// 选择语言
const selectLanguage = (lang, event) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  const { domain, date } = route.params
  router.push(`/feeds/${domain}/${date}/${lang}`)
  dropdownStore.closeAll()
}

// 在组件挂载时添加全局点击事件监听器
onMounted(() => {
  document.addEventListener('click', () => {
    dropdownStore.closeAll()
  })
})
</script>
