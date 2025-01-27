<template>
  <div class="relative date-picker">
    <button
      @click="toggleDropdown($event)"
      class="flex items-center space-x-0.5 md:space-x-2 px-1.5 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-100 text-sm md:text-base whitespace-nowrap"
      ref="triggerButton"
    >
      <span>{{ formatDateString(selectedDate) }}</span>
      <span class="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-400 flex items-center justify-center leading-none">▼</span>
    </button>

    <div
      v-if="showDropdown"
      class="absolute top-full mt-1 md:mt-2 bg-white rounded-lg shadow-lg py-1 md:py-2 left-1/2 -translate-x-1/2"
      :style="{ minWidth: buttonWidth + 'px' }"
    >
      <div class="flex justify-between items-center px-2 md:px-4 py-1 md:py-2 border-b text-sm md:text-base">
        <button @click="prevDate($event)" class="text-gray-600 hover:text-gray-900 flex items-center">
          <span class="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">◀️</span>
        </button>
        <button
          @click="nextDate($event)"
          class="text-gray-600 hover:text-gray-900 flex items-center"
          :disabled="isToday"
        >
          <span class="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">▶️</span>
        </button>
      </div>
      <div class="max-h-64 overflow-y-auto">
        <button
          v-for="date in availableDates"
          :key="date"
          @click="selectDate(date, $event)"
          class="w-full px-4 py-2 hover:bg-gray-100 flex items-center justify-center text-sm md:text-base whitespace-nowrap"
          :class="{ 'bg-primary/10 text-primary': date === selectedDate || date === todayStr }"
        >
          <span>{{ formatDateString(date) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useDropdownStore } from '~/stores/dropdown'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const dropdownStore = useDropdownStore()

// 组件ID
const DROPDOWN_ID = 'date-picker'

// 日期格式化函数
const formatDateString = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 检查是否显示下拉菜单
const showDropdown = computed(() => dropdownStore.activeDropdown === DROPDOWN_ID)

// 获取当前选中的日期
const selectedDate = computed(() => {
  const dateParam = route.params.date
  return dateParam || formatDateString(new Date())
})

// 获取今天的日期字符串
const todayStr = computed(() => formatDateString(new Date()))

// 生成最近30天的日期列表
const availableDates = computed(() => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    dates.push(formatDateString(date))
  }
  return dates
})

// 检查是否为今天
const isToday = computed(() => {
  return selectedDate.value === todayStr.value
})

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

// 选择日期
const selectDate = (date, event) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  const { domain, language } = route.params
  if (!domain || !language) {
    console.warn('Missing route params:', { domain, language })
    return
  }
  
  router.push(`/feeds/${domain}/${date}/${language}`)
  dropdownStore.closeAll()
}

// 前一天
const prevDate = (event) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  const currentIndex = availableDates.value.indexOf(selectedDate.value)
  if (currentIndex < availableDates.value.length - 1) {
    selectDate(availableDates.value[currentIndex + 1], event)
  }
}

// 后一天
const nextDate = (event) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  if (!isToday.value) {
    const currentIndex = availableDates.value.indexOf(selectedDate.value)
    if (currentIndex > 0) {
      selectDate(availableDates.value[currentIndex - 1], event)
    }
  }
}

// 按钮宽度
const triggerButton = ref(null)
const buttonWidth = ref(0)

// 在组件挂载时添加全局点击事件监听器
onMounted(() => {
  // 获取按钮宽度
  if (triggerButton.value) {
    buttonWidth.value = triggerButton.value.offsetWidth
  }
  
  document.addEventListener('click', () => {
    dropdownStore.closeAll()
  })
})
</script>
