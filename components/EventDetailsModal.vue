<template>
  <!-- 整个遮罩层 + 居中的容器 -->
  <div class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
    <!-- 半透明背景，点击关闭 -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50" 
      @click="!$route.query.share && handleClose"
    ></div>

    <!-- 水平容器，水平排列所有卡片，竖直方向居中对齐 -->
    <div 
      class="relative z-10 w-full h-full flex items-center justify-center"
      @keydown.esc="!$route.query.share && handleClose"
      tabindex="0"
      ref="containerRef"
    >
      <!-- 移动端卡片 -->
      <MobileCard
        v-if="isMobile"
        :post="selectedTpost"
        :adjacent-post="adjacentTpost"
        :posts="$route.query.share ? [selectedTpost] : event.tposts"
        :slide-offset="slideOffset"
        :slide-direction="slideDirection"
        :slide-progress="slideProgress"
        :is-animating="isAnimating"
        :current-index="selectedIndex"
        :is-share="!!$route.query.share"
        @close="handleClose"
        @touch-start="handleTouchStart"
        @touch-move="handleTouchMove"
        @touch-end="handleTouchEnd"
        @slide-complete="(direction, targetIndex) => {
          // 如果提供了目标索引，直接跳转到该索引
          if (typeof targetIndex === 'number') {
            selectTpost(targetIndex)
            return
          }
          // 否则根据方向切换到相邻的卡片
          if (direction === 'left' && selectedIndex < event.tposts.length - 1) {
            selectTpost(selectedIndex + 1)
          } else if (direction === 'right' && selectedIndex > 0) {
            selectTpost(selectedIndex - 1)
          }
        }"
      />

      <!-- PC端卡片列表 -->
      <template v-else>
        <div class="relative flex items-center w-full h-full">
          <!-- 左右箭头导航 -->
          <button 
            v-show="selectedIndex > 0"
            @click="handlePrevious"
            class="absolute left-8 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow hover:bg-white dark:hover:bg-gray-700 transition-all"
          >
            <span class="text-2xl text-gray-600 dark:text-gray-300">←</span>
          </button>
          
          <button 
            v-show="selectedIndex < event.tposts.length - 1"
            @click="handleNext"
            class="absolute right-8 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow hover:bg-white dark:hover:bg-gray-700 transition-all"
          >
            <span class="text-2xl text-gray-600 dark:text-gray-300">→</span>
          </button>

          <!-- 卡片列表容器 -->
          <div 
            class="relative flex items-center w-full h-full scrollbar-hide px-8"
            :style="{ transform: `translateX(${cardListOffset}px)` }"
          >
            <TransitionGroup 
              name="card-list"
              tag="div"
              class="flex items-center space-x-4 card-container"
            >
              <div
                v-for="(post, index) in event.tposts"
                :key="post.tpostId"
                class="flex-shrink-0 transition-all duration-500"
                :class="{
                  'transform': true,
                  'scale-100': index === selectedIndex,
                  'scale-55 hover:scale-80': index !== selectedIndex,
                  'translate-x-0': index === selectedIndex,
                  'translate-x-1': index > selectedIndex,
                  '-translate-x-1': index < selectedIndex
                }"
                :style="{
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: index === selectedIndex ? 10 : 0
                }"
                @click="selectTpost(index)"
              >
                <DesktopCard
                  :post="post"
                  :is-selected="index === selectedIndex"
                  @close="handleClose"
                />
              </div>
            </TransitionGroup>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useEventDetails } from '~/composables/useEventDetails'
import { useRouter } from 'vue-router'
import MobileCard from './event-details/MobileCard.vue'
import DesktopCard from './event-details/DesktopCard.vue'

const router = useRouter()

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  initialTpostIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

// 选中的推文索引
const selectedIndex = ref(props.initialTpostIndex)

// 获取当前选中的 tpost
const selectedTpost = computed(() => props.event.tposts?.[selectedIndex.value] || null)

// 获取相邻的 tpost（用于移动端滑动）
const adjacentTpost = computed(() => {
  if (!props.event.tposts) return null
  const nextIndex = selectedIndex.value + (slideDirection.value === 'left' ? -1 : 1)
  return props.event.tposts[nextIndex]
})

// 更新 URL 参数的函数
const updateUrlParams = (tpostId) => {
  // 保留当前的 share 参数
  const currentQuery = { ...router.currentRoute.value.query }
  
  // 更新 tid
  currentQuery.tid = tpostId
  
  router.push({
    query: currentQuery
  })
}

// 切换到指定卡片
const selectTpost = (index) => {
  selectedIndex.value = index
  const tpost = props.event.tposts[index]
  if (tpost) {
    updateUrlParams(tpost.tpostId)
  }
}

// 切换到上一个卡片
const handlePrevious = () => {
  if (selectedIndex.value > 0) {
    selectTpost(selectedIndex.value - 1)
  }
}

// 切换到下一个卡片
const handleNext = () => {
  if (selectedIndex.value < props.event.tposts.length - 1) {
    selectTpost(selectedIndex.value + 1)
  }
}

const handleClose = () => {
  emit('close')
}

const {
  touchStart,
  slideOffset,
  slideDirection,
  isMobile,
  isAnimating,
  slideProgress,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
} = useEventDetails({
  onClose: handleClose,
  onPrevious: handlePrevious,
  onNext: handleNext
})

const containerRef = ref(null)
const cardListOffset = computed(() => {
  if (!containerRef.value) return 0
  
  const containerWidth = containerRef.value.offsetWidth
  const selectedCardWidth = 600 // 大卡片宽度
  const smallCardWidth = 280 // 小卡片宽度
  const cardSpacing = 16 // 改为16px (space-x-4)
  const containerPadding = 100 // 增加padding补偿
  
  // 计算选中卡片左侧的卡片总宽度
  const leftCardsWidth = selectedIndex.value * (smallCardWidth + cardSpacing)
  
  // 计算选中卡片应该在的位置（屏幕中央）
  // 需要考虑容器的padding和额外的左偏移
  const centerPosition = (containerWidth - containerPadding - selectedCardWidth) / 2
  
  // 计算需要的偏移量，增加一个小的左偏移
  return centerPosition - leftCardsWidth + 16 // 增加16px的左偏移
})

watch(selectedIndex, async (newIndex) => {
  // 等待 DOM 更新
  await nextTick()
  
  // 更新所有卡片的 isSelected 状态
  const cards = document.querySelectorAll('.desktop-card')
  cards.forEach((card, index) => {
    const cardComponent = card.__vue__
    if (cardComponent && cardComponent.setSelected) {
      cardComponent.setSelected(index === newIndex)
    }
  })
})

onMounted(async () => {
  await nextTick()
  const firstCard = document.querySelector('.desktop-card')?.__vue__
  if (firstCard && firstCard.setSelected) {
    firstCard.setSelected(true)
  }
})
</script>

<style scoped>
/* 卡片列表动画 */
.card-list-move {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.75);
}

.card-list-leave-active {
  position: absolute;
}

/* 确保所有卡片在垂直方向上居中 */
.card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加滚动条样式 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
