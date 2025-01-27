<template>
  <div class="absolute inset-0 pointer-events-none">
    <!-- 左侧小卡片 -->
    <div 
      class="absolute top-1/2 -translate-y-1/2 flex items-center space-x-4"
      :style="{ right: 'calc(50% + 320px)' }"
    >
      <TransitionGroup 
        name="card-left"
        @before-enter="isAnimating = true"
        @after-leave="() => { isAnimating = false; targetIndex.value = null }"
      >
        <template v-for="(post, index) in posts" :key="post.tpostId">
          <div
            v-if="index < selectedIndex && index !== targetIndex"
            @click="onSelect(index)"
            class="relative rounded-xl shadow-md border border-gray-200 dark:border-gray-600 p-3 flex flex-col cursor-pointer hover:shadow-lg transition-all pointer-events-auto overflow-hidden"
            :style="{
              aspectRatio: '3 / 4',
              width: '180px',
              background: getGradientBackground(post.title)
            }"
          >
            <!-- Pattern overlay -->
            <div 
              v-if="shouldShowPattern(post.title)"
              class="absolute inset-0 pattern-overlay"
              :class="getPatternClass(post.title)"
            ></div>

            <h3 class="text-sm font-medium text-center text-gray-100 line-clamp-5 mb-auto relative">
              {{ post.title }}
            </h3>
            <div class="flex flex-col items-center mt-2">
              <img
                :src="post.avatar || 'https://www.gravatar.com/avatar/?d=mp'"
                :alt="post.author"
                class="w-8 h-8 rounded-full mb-1 border border-gray-300 dark:border-gray-600"
              />
              <span class="text-xs text-gray-100">
                @{{ post.author }}
              </span>
              <div class="text-xs text-gray-200 mt-1">
                粉丝 {{ formatFollowerCount(post.followerCount) }}
              </div>
            </div>
          </div>
        </template>
      </TransitionGroup>
    </div>

    <!-- 右侧小卡片 -->
    <div 
      class="absolute top-1/2 -translate-y-1/2 flex items-center space-x-4"
      :style="{ left: 'calc(50% + 320px)' }"
    >
      <TransitionGroup 
        name="card-right"
        @before-enter="isAnimating = true"
        @after-leave="() => { isAnimating = false; targetIndex.value = null }"
      >
        <template v-for="(post, index) in posts" :key="post.tpostId">
          <div
            v-if="index > selectedIndex && index !== targetIndex"
            @click="onSelect(index)"
            class="relative rounded-xl shadow-md border border-gray-200 dark:border-gray-600 p-3 flex flex-col cursor-pointer hover:shadow-lg transition-all pointer-events-auto overflow-hidden"
            :style="{
              aspectRatio: '3 / 4',
              width: '180px',
              background: getGradientBackground(post.title)
            }"
          >
            <!-- Pattern overlay -->
            <div 
              v-if="shouldShowPattern(post.title)"
              class="absolute inset-0 pattern-overlay"
              :class="getPatternClass(post.title)"
            ></div>

            <h3 class="text-sm font-medium text-center text-gray-100 line-clamp-5 mb-auto relative">
              {{ post.title }}
            </h3>
            <div class="flex flex-col items-center mt-2">
              <img
                :src="post.avatar || 'https://www.gravatar.com/avatar/?d=mp'"
                :alt="post.author"
                class="w-8 h-8 rounded-full mb-1 border border-gray-300 dark:border-gray-600"
              />
              <span class="text-xs text-gray-100">
                @{{ post.author }}
              </span>
              <div class="text-xs text-gray-200 mt-1">
                粉丝 {{ formatFollowerCount(post.followerCount) }}
              </div>
            </div>
          </div>
        </template>
      </TransitionGroup>
    </div>

    <!-- 被选中的卡片（用于动画） -->
    <div 
      v-if="targetIndex !== null"
      class="absolute top-1/2 -translate-y-1/2 pointer-events-none"
      :style="direction === 'right' ? { right: 'calc(50% + 320px)' } : { left: 'calc(50% + 320px)' }"
    >
      <div
        class="relative rounded-xl shadow-md border border-gray-200 dark:border-gray-600 p-3 flex flex-col overflow-hidden"
        :class="{
          'selected-card': true,
          'selected-card-right': direction === 'right',
          'selected-card-left': direction === 'left'
        }"
        :style="{
          aspectRatio: '3 / 4',
          width: '180px',
          background: getGradientBackground(posts[targetIndex].title)
        }"
      >
        <!-- Pattern overlay -->
        <div 
          v-if="shouldShowPattern(posts[targetIndex].title)"
          class="absolute inset-0 pattern-overlay"
          :class="getPatternClass(posts[targetIndex].title)"
        ></div>

        <h3 class="text-sm font-medium text-center text-gray-100 line-clamp-5 mb-auto relative">
          {{ posts[targetIndex].title }}
        </h3>
        <div class="flex flex-col items-center mt-2">
          <img
            :src="posts[targetIndex].avatar || 'https://www.gravatar.com/avatar/?d=mp'"
            :alt="posts[targetIndex].author"
            class="w-8 h-8 rounded-full mb-1 border border-gray-300 dark:border-gray-600"
          />
          <span class="text-xs text-gray-100">
            @{{ posts[targetIndex].author }}
          </span>
          <div class="text-xs text-gray-200 mt-1">
            粉丝 {{ formatFollowerCount(posts[targetIndex].followerCount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getGradientBackground, shouldShowPattern, getPatternClass } from '~/utils/colorUtils'

const props = defineProps({
  posts: {
    type: Array,
    required: true
  },
  selectedIndex: {
    type: Number,
    required: true
  }
})

const prevSelectedIndex = ref(props.selectedIndex)
const direction = ref('right')
const targetIndex = ref(null)
const isAnimating = ref(false)

watch(() => props.selectedIndex, (newVal, oldVal) => {
  // 如果正在动画中，忽略这次切换
  if (isAnimating.value) {
    return
  }

  isAnimating.value = true
  direction.value = newVal > oldVal ? 'right' : 'left'
  targetIndex.value = oldVal

  // 动画结束后重置状态
  setTimeout(() => {
    isAnimating.value = false
    targetIndex.value = null
  }, 500)
})

const emit = defineEmits(['select'])

function onSelect(index) {
  // 如果正在动画中，不允许切换
  if (isAnimating.value) {
    return
  }
  emit('select', index)
}

function formatFollowerCount(count) {
  return count > 10000 ? `${(count / 10000).toFixed(1)}w` : count
}
</script>

<style scoped>
/* 左侧卡片动画 */
.card-left-move,
.card-left-enter-active,
.card-left-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-left-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.card-left-leave-to {
  opacity: 0;
  transform: translate(calc(50vw - 180px), 0) scale(2);
}

.card-left-leave-active {
  position: absolute;
  z-index: 50;
}

/* 右侧卡片动画 */
.card-right-move,
.card-right-enter-active,
.card-right-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-right-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.card-right-leave-to {
  opacity: 0;
  transform: translate(calc(-50vw + 180px), 0) scale(2);
}

.card-right-leave-active {
  position: absolute;
  z-index: 50;
}

/* 被选中卡片的动画 */
.selected-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
}

.selected-card-right {
  transform: translate(calc(50vw - 180px), 0) scale(2);
  opacity: 0;
}

.selected-card-left {
  transform: translate(calc(-50vw + 180px), 0) scale(2);
  opacity: 0;
}

/* 其他样式保持不变 */
.pattern-overlay {
  pointer-events: none;
  opacity: 0.05;
}

.pattern-dots {
  background-image: radial-gradient(currentColor 1px, transparent 1px);
  background-size: 16px 16px;
}

.pattern-lines {
  background-image: repeating-linear-gradient(
    45deg,
    currentColor,
    currentColor 1px,
    transparent 1px,
    transparent 10px
  );
}

.pattern-grid {
  background-image: 
    linear-gradient(currentColor 1px, transparent 1px),
    linear-gradient(90deg, currentColor 1px, transparent 1px);
  background-size: 16px 16px;
}

.pattern-diagonal {
  background-image: repeating-linear-gradient(
    -45deg,
    currentColor,
    currentColor 1px,
    transparent 1px,
    transparent 10px
  );
}
</style>
