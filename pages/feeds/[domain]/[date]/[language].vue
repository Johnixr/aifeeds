<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
    <!-- 筛选区 -->
    <div class="backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-10 shadow-sm">
      <div class="container mx-auto px-2 sm:px-4">
        <div class="flex flex-col py-2 sm:py-3">
          <!-- 一级标签 -->
          <div class="relative mb-1.5 sm:mb-2">
            <div 
              class="flex gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar scroll-smooth relative"
              ref="primaryTagsRef"
            >
              <button
                v-for="tag in primaryTags"
                :key="tag.name"
                :ref="el => { if (el) primaryTagRefs[primaryTags.indexOf(tag)] = el }"
                class="shrink-0 px-2.5 sm:px-4 h-6 sm:h-8 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 flex items-center gap-0.5 sm:gap-1 relative z-10"
                :class="{
                  'text-white': selectedPrimaryTag === tag.name,
                  'text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-gray-50/80': selectedPrimaryTag !== tag.name
                }"
                @click="handlePrimaryTagClick(tag.name)"
              >
                <span>{{ tag.name }}</span>
                <span class="text-[10px] sm:text-xs opacity-75">({{ tag.count }})</span>
              </button>

              <!-- 一级标签滑块 -->
              <div
                class="absolute rounded-full bg-primary-500 shadow-sm transition-all duration-200 ease-out"
                :style="{
                  transform: `translateX(${primaryTagPosition}px)`,
                  width: primaryTagWidth + 'px',
                  height: primaryTagHeight + 'px',
                  top: '0px'
                }"
              ></div>
            </div>
          </div>

          <!-- 二级标签 -->
          <div 
            v-if="selectedPrimaryTag !== '全部'"
            class="relative"
          >
            <div 
              class="flex gap-1 sm:gap-2 overflow-x-auto hide-scrollbar scroll-smooth"
              ref="secondaryTagsRef"
            >
              <div class="flex gap-1 sm:gap-2 relative">
                <button
                  v-for="tag in secondaryTags"
                  :key="tag.name"
                  :ref="el => { if (el) secondaryTagRefs[secondaryTags.indexOf(tag)] = el }"
                  class="shrink-0 px-2.5 sm:px-3 h-6 sm:h-7 text-[11px] sm:text-xs font-normal whitespace-nowrap transition-all duration-200 ease-out flex items-center gap-1.5 sm:gap-1 relative hover:shadow-sm"
                  :class="{
                    'text-primary-600 border-transparent z-20': selectedSecondaryTag === tag.name && showSecondarySlider,
                    'text-primary-600 border-primary-100 bg-primary-50 shadow-sm': selectedSecondaryTag === tag.name && !showSecondarySlider,
                    'bg-white/80 text-gray-500 hover:bg-gray-50/80 hover:text-gray-700 border border-gray-200/70': selectedSecondaryTag !== tag.name
                  }"
                  @click="handleSecondaryTagClick(tag.name)"
                >
                  <span>{{ tag.name }}</span>
                  <span class="text-[8px] sm:text-[10px] opacity-75">({{ tag.count }})</span>
                </button>

                <!-- 二级标签滑块 -->
                <div
                  v-show="showSecondarySlider"
                  class="tag-slider absolute bg-primary-50 border border-primary-100 shadow-sm transition-all duration-200 ease-out z-10"
                  :style="{
                    transform: `translateX(${secondaryTagPosition}px)`,
                    width: secondaryTagWidth + 'px',
                    height: secondaryTagHeight + 'px'
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="py-8 container mx-auto px-0">
      <!-- 内容列表 -->
      <div class="w-full animate-fade-in">
        <div ref="gridRef" class="masonry-grid">
          <!-- 用于计算列宽的元素 -->
          <div class="grid-sizer"></div>
          
          <div
            v-for="event in sortedEvents"
            :key="event.eventId"
            @click="handleEventClick(event)"
            class="grid-item"  
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1">
              <!-- 封面图 -->
              <EventCoverImage
                :src="event.cover"
                :title="event.title"
                @load="handleImageLoaded"
                @error="handleImageLoaded"
              />
              <!-- 内容区域 -->
              <div class="p-3 sm:p-4">
                <!-- 标题 -->
                <h3 class="text-sm sm:text-base font-medium mb-2 hover:text-primary-500 dark:text-gray-100">{{ event.title }}</h3>
                
                <!-- 标签 -->
                <div class="flex flex-wrap gap-0.5 mb-3">
                  <span 
                    v-for="tag in event.tags" 
                    :key="tag"
                    class="px-1 py-[1px] text-[9px] leading-[14px] rounded-full bg-gray-50/80 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-100/70 dark:border-gray-600"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- 底部信息 -->
                <div class="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  <div class="flex items-center space-x-2">
                    <span class="flex items-center">
                      <span class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 mr-0.5 sm:mr-1 flex items-center justify-center leading-none">🔥</span>
                      {{ roundNumber(event.hotValue * 100) }}
                    </span>
                    <span class="flex items-center" v-if="event.tposts.length > 1">
                      <span class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 flex items-center justify-center leading-none" >📄</span>
                      {{ event.tposts.length }}
                    </span>
                  </div>
                  <time 
                    :datetime="event.createDate" 
                    class="text-gray-400 dark:text-gray-500"
                    :title="formatDate(event.createDate)"
                  >
                    {{ formatDate(event.createDate) }}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div 
        v-if="sortedEvents.length === 0" 
        class="w-full text-center py-12 animate-fade-in"
      >
        <div class="text-surface-400">
          <div class="w-16 h-16 mx-auto mb-4 text-4xl flex items-center justify-center">📭</div>
          <p class="text-lg">暂无相关内容</p>
        </div>
      </div>
    </div>
    
    <!-- 事件详情模态框 -->
    <EventDetailsModal
      v-if="showModal && selectedEvent"
      :event="selectedEvent"
      :initial-tpost-index="initialTpostIndex"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFeedsStore } from '~/stores/feeds'
import { useSortStore } from '~/stores/sort'
import Masonry from 'masonry-layout'
import EventCoverImage from '~/components/EventCoverImage.vue'
import EventDetailsModal from '~/components/EventDetailsModal.vue'
import { formatDate } from '~/utils/date'
import { TAG_TREE, PRIMARY_TAG_ORDER } from '~/constants/tags'

const route = useRoute()
const router = useRouter()
const store = useFeedsStore()
const sortStore = useSortStore()
const { events } = storeToRefs(store)
const gridRef = ref(null)
let masonry = null

// 标签动效相关的状态
const primaryTagsRef = ref(null)
const secondaryTagsRef = ref(null)
const selectedPrimaryTag = ref('全部')
const selectedSecondaryTag = ref('全部')

// 计算属性
const primaryTags = computed(() => {
  const tagCounts = new Map()
  
  // Count events for each primary tag
  events.value.forEach(event => {
    // 用于确保每个事件在每个一级标签中只被计算一次
    const countedForPrimary = new Set()
    
    event.tags.forEach(tag => {
      // Find which primary tag this belongs to
      for (const [primary, secondaries] of Object.entries(TAG_TREE)) {
        if ((tag === primary || secondaries.includes(tag)) && !countedForPrimary.has(primary)) {
          tagCounts.set(primary, (tagCounts.get(primary) || 0) + 1)
          countedForPrimary.add(primary)
        }
      }
    })
  })
  
  // Filter and sort primary tags based on the fixed order
  const sortedTags = PRIMARY_TAG_ORDER
    .filter(tag => tagCounts.has(tag) && tagCounts.get(tag) > 0)
    .map(tag => ({
      name: tag,
      count: tagCounts.get(tag)
    }))

  // Add "全部" at the beginning
  return [{ name: '全部', count: events.value.length }, ...sortedTags]
})

const secondaryTags = computed(() => {
  if (selectedPrimaryTag.value === '全部') return []
  
  const secondaryTagList = TAG_TREE[selectedPrimaryTag.value] || []
  const tagCounts = new Map()
  
  // 先计算直接使用一级标签的事件数量
  const primaryTagEvents = events.value.filter(event => 
    event.tags.includes(selectedPrimaryTag.value)
  ).length
  
  // 计算每个二级标签的事件数量
  events.value.forEach(event => {
    if (event.tags.some(tag => tag === selectedPrimaryTag.value || secondaryTagList.includes(tag))) {
      event.tags.forEach(tag => {
        if (secondaryTagList.includes(tag)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      })
    }
  })
  
  // Filter and sort secondary tags
  const sortedTags = secondaryTagList
    .filter(tag => tagCounts.has(tag) && tagCounts.get(tag) > 0)
    .map(tag => ({
      name: tag,
      count: tagCounts.get(tag)
    }))
    .sort((a, b) => b.count - a.count)

  // Add "全部" at the beginning
  // 总数是使用一级标签的事件数量加上使用二级标签的事件数量（需要去重）
  const totalEvents = events.value.filter(event => 
    event.tags.some(tag => tag === selectedPrimaryTag.value || secondaryTagList.includes(tag))
  ).length
  
  return [{ name: '全部', count: totalEvents }, ...sortedTags]
})

const sortedEvents = computed(() => {
  let filteredEvents = events.value

  // 根据标签过滤
  if (selectedPrimaryTag.value !== '全部') {
    const secondaryTagList = TAG_TREE[selectedPrimaryTag.value] || []
    filteredEvents = filteredEvents.filter(event => {
      if (selectedSecondaryTag.value === '全部') {
        // 如果选择了"全部"，显示所有属于当前一级标签的事件
        return event.tags.some(tag => 
          tag === selectedPrimaryTag.value || secondaryTagList.includes(tag)
        )
      } else if (selectedSecondaryTag.value) {
        // 如果选择了具体的二级标签，只显示包含该标签的事件
        return event.tags.includes(selectedSecondaryTag.value)
      }
      // 如果没有选择二级标签，显示所有属于当前一级标签的事件
      return event.tags.some(tag => 
        tag === selectedPrimaryTag.value || secondaryTagList.includes(tag)
      )
    })
  }

  // 根据排序方式排序
  return [...filteredEvents].sort((a, b) => {
    if (sortStore.sortByHot) {
      // 按热度排序（hotValue 大的在前）
      return b.hotValue - a.hotValue
    } else {
      // 按时间排序（最新的在前）
      return new Date(b.publishTime) - new Date(a.publishTime)
    }
  })
})

// 处理一级标签点击
const handlePrimaryTagClick = async (tag) => {
  if (selectedPrimaryTag.value === tag) return
  
  selectedPrimaryTag.value = tag
  selectedSecondaryTag.value = '全部'
  
  // 在标签切换后，尝试将选中的标签滚动到视图中间
  await nextTick()
  const container = primaryTagsRef.value
  const selectedButton = container.querySelector(`button:nth-child(${primaryTags.value.findIndex(t => t.name === tag) + 1})`)
  
  if (container && selectedButton) {
    const containerWidth = container.offsetWidth
    const buttonLeft = selectedButton.offsetLeft
    const buttonWidth = selectedButton.offsetWidth
    const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
    
    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    })
  }
  
  // 重新初始化 masonry 布局
  if (masonry) {
    masonry.destroy()
    masonry = null
  }
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100)) // 给一点额外时间让DOM更新
  initMasonry()
}

// 处理二级标签点击
const handleSecondaryTagClick = async (tag) => {
  if (selectedSecondaryTag.value === tag) return
  selectedSecondaryTag.value = tag
  
  // 更新滑块位置
  await nextTick()
  const selectedIndex = secondaryTags.value.findIndex(t => t.name === tag)
  const prevIndex = secondaryTags.value.findIndex(t => t.name === selectedSecondaryTag.value)
  
  if (selectedIndex > -1 && prevIndex > -1 && 
      secondaryTagRefs.value[selectedIndex] && secondaryTagRefs.value[prevIndex]) {
    const currentElement = secondaryTagRefs.value[selectedIndex]
    const prevElement = secondaryTagRefs.value[prevIndex]
    
    // 判断是否同行并显示滑块
    const isSameRow = Math.abs(currentElement.offsetTop - prevElement.offsetTop) < 5
    showSecondarySlider.value = isSameRow
    
    if (isSameRow) {
      // 更新滑块位置
      secondaryTagPosition.value = currentElement.offsetLeft
      secondaryTagWidth.value = currentElement.offsetWidth
      secondaryTagHeight.value = currentElement.offsetHeight
    }
  }
  
  // 滚动到中间位置
  const container = secondaryTagsRef.value
  const selectedButton = secondaryTagRefs.value[selectedIndex]
  
  if (container && selectedButton) {
    const containerWidth = container.offsetWidth
    const buttonLeft = selectedButton.offsetLeft
    const buttonWidth = selectedButton.offsetWidth
    const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
    
    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    })
  }
  
  // 重新初始化 masonry 布局
  if (masonry) {
    masonry.destroy()
    masonry = null
  }
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100)) // 给一点额外时间让DOM更新
  initMasonry()
}

// 处理图片加载
const handleImageLoaded = () => {
  // 在下一个 tick 重新布局，确保 DOM 已更新
  nextTick(() => {
    if (masonry) {
      masonry.layout()
    }
  })
}

// 初始化 Masonry
const initMasonry = () => {
  if (!gridRef.value) return

  // 设置列宽
  updateColumnStyles()

  // 创建新的 masonry 实例
  masonry = new Masonry(gridRef.value, {
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    gutter: 16,
    percentPosition: true,
    horizontalOrder: true,
    fitWidth: false,
    transitionDuration: 0,
    initLayout: true,
    resize: true
  })
}

// 监听数据变化，重新初始化 Masonry
watch([() => events.value, () => sortStore.sortByHot, () => selectedPrimaryTag.value, () => selectedSecondaryTag.value], async () => {
  if (masonry) {
    masonry.destroy()
    masonry = null
  }
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100)) // 给一点额外时间让DOM更新
  initMasonry()
}, { deep: true })

// 监听事件数据变化，处理 URL 参数
watch(() => events.value, (newEvents) => {
  if (newEvents && newEvents.length > 0) {
    const { tid } = route.query
    if (tid) {
      // 遍历所有事件找到包含该 tid 的事件
      for (const event of newEvents) {
        const tpostIndex = event.tposts.findIndex(t => t.tpostId === tid)
        if (tpostIndex !== -1) {
          selectedEvent.value = event
          initialTpostIndex.value = tpostIndex
          showModal.value = true
          break
        }
      }
    }
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(async () => {
  nextTick(() => {
    initMasonry()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  })
  
  // 监听浏览器后退/前进按钮
  window.addEventListener('popstate', () => {
    // 如果 URL 不包含 tid，说明是回到列表页，关闭模态框
    if (!route.query.tid) {
      selectedEvent.value = null
      showModal.value = false
    }
  })
})

// 监听窗口大小变化
let resizeTimeout = null
const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = setTimeout(() => {
    updateColumnStyles()
  }, 100)
}

// 计算合适的列数
const calculateColumns = () => {
  const width = window.innerWidth
  const containerWidth = width * 0.95  // 容器宽度（使用95%的屏幕宽度）
  const gutter = 16  // 列间距
  const minColumnWidth = 240  // 最小列宽
  const maxColumns = 6  // 最大列数限制
  const minColumns = 2  // 最少2列

  // 基于屏幕宽度计算理想列数
  let columns = Math.floor((containerWidth + gutter) / (minColumnWidth + gutter))
  
  // 确保列数在限制范围内
  columns = Math.max(minColumns, Math.min(maxColumns, columns))

  return columns
}

// 更新列宽样式
const updateColumnStyles = () => {
  const columns = calculateColumns()
  const gutter = 16  // 列间距
  const style = document.createElement('style')
  
  // 计算每列的宽度百分比，考虑间距
  const columnWidthPercent = 100 / columns
  const gutterOffset = (columns - 1) * gutter / columns

  style.textContent = `
    .grid-sizer,
    .grid-item {
      width: calc(${columnWidthPercent}% - ${gutterOffset}px);
    }
  `
  
  // 移除旧的样式
  const oldStyle = document.getElementById('masonry-styles')
  if (oldStyle) {
    oldStyle.remove()
  }
  
  // 添加新的样式
  style.id = 'masonry-styles'
  document.head.appendChild(style)
  
  // 重新布局
  if (masonry) {
    nextTick(() => {
      masonry.layout()
    })
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (masonry) {
    masonry.destroy()
  }
})

// 初始数据加载
onMounted(async () => {
  const { domain, date, language } = route.params
  if (domain && date && language) {
    await store.fetchEvents({ domain, date, language })
  }
  
  nextTick(() => {
    initMasonry()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  })
})

// 使用路由导航守卫来处理数据获取
onBeforeRouteUpdate(async (to, from, next) => {
  const { domain, date, language } = to.params
  
  // 检查参数是否真的改变了
  if (from.params.domain === domain && 
      from.params.date === date && 
      from.params.language === language) {
    next()
    return
  }

  if (domain && date && language) {
    await store.fetchEvents({ domain, date, language })
  }
  next()
})

// 添加新的响应式变量用于控制模态框
const selectedEvent = ref(null)
const showModal = ref(false)
const initialTpostIndex = ref(0)

// 修改事件点击处理函数，更新 URL 但不跳转页面
const handleEventClick = (event) => {
  const tpostId = event.tposts[0].tpostId
  
  // 只使用 tid 参数
  router.push({
    query: {
      tid: tpostId
    }
  })
  
  selectedEvent.value = event
  showModal.value = true
}

// 处理模态框关闭
const handleModalClose = () => {
  selectedEvent.value = null
  router.push({ query: {} })
}

const roundNumber = (num) => {
  return Math.round(num)
}

// 二级标签滑块相关状态
const secondaryTagRefs = ref([])
const secondaryTagPosition = ref(0)
const secondaryTagWidth = ref(0)
const secondaryTagHeight = ref(0)
const showSecondarySlider = ref(false)

// 监听滚动重置滑块状态
watch(() => selectedPrimaryTag.value, () => {
  showSecondarySlider.value = false
})

// 一级标签滑块相关状态
const primaryTagRefs = ref([])
const primaryTagPosition = ref(0)
const primaryTagWidth = ref(0)
const primaryTagHeight = ref(0)

// 更新一级标签滑块位置
const updatePrimaryTagSlider = () => {
  const selectedIndex = primaryTags.value.findIndex(tag => tag.name === selectedPrimaryTag.value)
  if (selectedIndex === -1) return

  const selectedElement = primaryTagRefs.value[selectedIndex]
  if (!selectedElement) return

  primaryTagPosition.value = selectedElement.offsetLeft
  primaryTagWidth.value = selectedElement.offsetWidth
  primaryTagHeight.value = selectedElement.offsetHeight
}

// 监听选中的一级标签变化
watch(selectedPrimaryTag, () => {
  nextTick(updatePrimaryTagSlider)
})

// 组件挂载后初始化滑块位置
onMounted(() => {
  nextTick(updatePrimaryTagSlider)
})
</script>

<style scoped>
.masonry-grid {
  margin: 0 auto;
  width: 100%;
}

.grid-item {
  margin-bottom: 16px;
  box-sizing: border-box;
}

/* 确保图片加载时的平滑过渡 */
img {
  transition: opacity 0.3s ease-out;
  opacity: 0;
  will-change: opacity;
  display: block;
  width: 100%;
  height: auto;
}

img.loaded {
  opacity: 1;
}

/* 列表过渡动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch; /* 支持 iOS 滚动 */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 确保父容器不会滚动 */
.backdrop-blur-md {
  overscroll-behavior: contain;
}
</style>
