<template>
  <!-- 外层固定定位，全屏蒙层 -->
  <div class="mobile-card-wrapper">
    <!-- Background layer -->
    <div 
      class="absolute inset-0 bg-white dark:bg-gray-800 transition-all duration-500"
      :style="{ 
        background: getGradientBackground(post.title, 0.85),
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }"
    ></div>

    <!-- Pattern overlay -->
    <div 
      v-if="shouldShowPattern(post.title)"
      class="absolute inset-0 pattern-overlay transition-all duration-500 opacity-5"
      :class="getPatternClass(post.title)"
    ></div>
    <!-- ========== 左右切换图标（新增） ========== -->
    <!-- 如果当前 index > 0，则显示左箭头 -->
    <button
      v-if="showPrevButton && !props.isShare"
      class="nav-button left"
      @click="goToPrevCard"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path
          d="M15.375 19.781a.75.75 0 1 0 1.06-1.06L10.69 13.06a.75.75 0 0 1 0-1.06l5.745-5.66a.75.75 0 1 0-1.06-1.06l-5.745 5.66a2.25 2.25 0 0 0 0 3.181l5.745 5.66Z"
        ></path>
      </svg>
    </button>
    <!-- 如果当前 index < posts.length - 1，则显示右箭头 -->
    <button
      v-if="showNextButton && !props.isShare"
      class="nav-button right"
      @click="goToNextCard"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path
          d="M9.61 5.28a.75.75 0 0 0-1.06 1.06L14.3 12a.75.75 0 0 1 0 1.06l-5.745 5.66a.75.75 0 1 0 1.06 1.06l5.745-5.66a2.25 2.25 0 0 0 0-3.18L9.61 5.28Z"
        ></path>
      </svg>
    </button>
    <!-- ========== 左右切换图标（新增） ========== -->

    <!-- 单卡片切换动画：只显示一张卡片 -->
    <div 
      class="cards-container"
      :style="{ transform: `translateX(${touchDelta}px)` }"
    >
      <transition :name="transitionName">
        <!-- 注意：key 与当前索引或卡片 id 绑定，用于触发过渡动画 -->
        <div
          v-if="post"
          :key="`post-${currentIndex}`"
          class="mobile-card-content"
          :style="{ 
            transform: getScaleTransform,
            opacity: getOpacity,
            background: getGradientBackground(post.title, 0.65)
          }"
          @touchstart.stop="handleTouchStart"
          @touchmove.stop="handleTouchMove"
          @touchend.stop="handleTouchEnd"
        >
          <!-- 关闭按钮 -->
          <div v-if="!props.isShare" class="close-button-container">
            <button
              @click="$emit('close')"
              class="close-button"
            >
              <span class="text-sm" style="color: rgba(0, 0, 0, 0.5)">✕</span>
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="content-container" :style="{ background: 'transparent' }">
            <!-- 标题 -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-6">
              {{ post.title }}
            </h3>

            <!-- 自定义头部信息 -->
            <PostHeader :post="post" class="mb-4" />

            <!-- markdown 内容 -->
            <div
              class="markdown-content prose prose-sm dark:prose-invert max-w-none rounded-lg mx-4 p-4"
              :style="{ background: 'transparent' }"
              v-html="renderedContent"
            />

            <!-- 嵌入推文 -->
            <div class="mt-4">
              <TweetEmbed :tpost-url="post.tpostUrl" class="mb-12" />
              
              <!-- 分享二维码 -->
              <div v-if="props.isShare" class="qr-code-container mt-20">
                <div class="qr-code-wrapper mx-auto rounded-lg shadow-sm">
                  <QRCodeVue3
                    :width="140"
                    :height="140"
                    :value="shareUrl"
                    :dotsOptions="{
                      type: 'dots',
                      color: '#1a1a1a',
                      gradient: qrCodeGradient
                    }"
                    :backgroundOptions="{
                      color: '#1C1C2D'
                    }"
                    :cornersSquareOptions="{
                      type: 'extra-rounded',
                      color: qrCodeGradient.colorStops[1].color
                    }"
                    :cornersDotOptions="{
                      type: 'dot',
                      color: qrCodeGradient.colorStops[0].color
                    }"
                  />
                </div>
                <div class="text-center text-sm text-gray-500 mt-2 mb-1 font-medium">
                  扫码查看原文
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- ========== 底部圆点指示器：去掉数量限制 ========== -->
    <div class="dots-container" v-if="dotList.length > 1">
      <button
        v-for="(item, index) in dotList"
        :key="index"
        class="dot-button"
        @click="handleDotClick(index)"
      >
        <span
          :class="['dot', { 'active': index === props.currentIndex }]"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import PostHeader from './PostHeader.vue'
import TweetEmbed from './TweetEmbed.vue'
import QRCodeVue3 from 'qrcode-vue3'
import { getGradientBackground, shouldShowPattern, getPatternClass, getRandomColorPair } from '~/utils/colorUtils'
import { useRoute } from 'vue-router'

const route = useRoute()

/**
 * 父组件需传入：
 * - post: 当前卡片对应的内容对象
 * - posts: 所有卡片集合，用于底部小圆点指示
 * - currentIndex: 当前选中卡片下标
 * - slideDirection: '' | 'left' | 'right'，切换方向
 * - isAnimating: 是否处于动画中
 * - isShare: 是否是分享模式
 */
const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  posts: {
    type: Array,
    default: () => []
  },
  slideDirection: {
    type: String,
    default: ''
  },
  slideOffset: {
    type: Number,
    default: 0
  },
  slideProgress: {
    type: Number,
    default: 0
  },
  isAnimating: {
    type: Boolean,
    default: false
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  isShare: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'touch-start',
  'touch-move',
  'touch-end',
  'slide-complete'
])

let touchStartX = 0
let touchMoveX = 0

// 添加触摸位移状态
const touchDelta = ref(props.slideOffset || 0)
const windowWidth = ref(0)

// 禁用背景滚动
const disableBackgroundScroll = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.height = '100vh'
}

// 恢复背景滚动
const enableBackgroundScroll = () => {
  document.body.style.overflow = ''
  document.body.style.height = ''
}

onMounted(() => {
  disableBackgroundScroll()
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})

onBeforeUnmount(() => {
  enableBackgroundScroll()
})

// 监听 slideOffset 变化
watch(() => props.slideOffset, (newVal) => {
  touchDelta.value = newVal
})

const getScaleTransform = computed(() => {
  if (!windowWidth.value) return 'scale(1)'
  return `scale(${1 - Math.abs(touchDelta.value) / (windowWidth.value * 5)})`
})

const getOpacity = computed(() => {
  if (!windowWidth.value) return 1
  return 1 - Math.abs(touchDelta.value) / (windowWidth.value * 2)
})

const handleTouchStart = (e) => {
  if (props.isShare) return
  touchStartX = e.touches[0].clientX
  touchDelta.value = 0
  emit('touch-start', e)
}

const handleTouchMove = (e) => {
  if (props.isShare) return
  touchMoveX = e.touches[0].clientX
  touchDelta.value = touchMoveX - touchStartX
  emit('touch-move', e)
}

const handleTouchEnd = () => {
  if (props.isShare) return
  const threshold = windowWidth.value * 0.4
  
  if (Math.abs(touchDelta.value) > threshold) {
    if (touchDelta.value < 0) {
      emit('slide-complete', 'left')
    } else {
      emit('slide-complete', 'right')
    }
  }
  
  touchDelta.value = 0
  emit('touch-end')
}

/** Markdown 渲染 */
const md = new MarkdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return ''
  }
})

const renderedContent = computed(() => {
  if (!props.post?.content) return ''
  return md.render(props.post.content.trim())
})

/** 圆点列表：不再限制为 6 个，而是全部展示 */
const dotList = computed(() => {
  return props.posts || []
})

/**
 * 根据 slideDirection 来选用过渡名
 * 若不需要动画，可返回空字符串
 */
const transitionName = computed(() => {
  if (!props.slideDirection) return ''
  return `slide-${props.slideDirection}`
})

/** ========== 新增的点击切换逻辑 ========== */
const goToPrevCard = () => {
  // 上一张卡片 => 触发向右切换动画
  emit('slide-complete', 'right')
}
const goToNextCard = () => {
  // 下一张卡片 => 触发向左切换动画
  emit('slide-complete', 'left')
}

// 更新模板中的判断条件
const showPrevButton = computed(() => {
  if (props.isShare) return false
  return props.currentIndex > 0
})

const showNextButton = computed(() => {
  if (props.isShare) return false
  return props.currentIndex < (props.posts?.length || 0) - 1
})

// 处理圆点点击
const handleDotClick = (index) => {
  const direction = index > props.currentIndex ? 'left' : 'right'
  emit('slide-complete', direction, index)
}

// 生成不带 share 参数的分享链接
const shareUrl = computed(() => {
  const currentQuery = { ...route.query }
  delete currentQuery.share
  
  const url = new URL(window.location.href)
  url.search = new URLSearchParams(currentQuery).toString()
  
  return url.toString()
})

// 获取二维码渐变色
const qrCodeGradient = computed(() => {
  if (!props.post?.title) return {}
  const [color1, color2] = getRandomColorPair(props.post.title)
  return {
    type: 'linear',
    rotation: 45,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 }
    ]
  }
})
</script>

<style scoped>
/* ======== 容器 & 布局 ======== */
.mobile-card-wrapper {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 添加最大高度限制 */
  max-height: 100vh;
  overflow: hidden;
}

.cards-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;  /* 防止切换时出现滚动条 */
  transition: transform 0.3s ease;
}

.mobile-card-content {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, opacity 0.3s ease;
  background-color: var(--tw-bg-opacity, 1);
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  @apply dark:bg-gray-800;
  /* 添加最大高度限制 */
  max-height: 100vh;
  overflow: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.mobile-card-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.close-button-container {
  position: sticky;
  top: 0;
  right: 0;
  z-index: 99999;
  height: 0;  
  margin: 0;
  padding: 0;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 0 1rem;  
  /* 添加最大高度限制和滚动行为 */
  max-height: calc(100vh - 4rem);  /* 减去上下padding的高度 */
  -webkit-overflow-scrolling: touch;  /* 使滚动更流畅 */
  overscroll-behavior: contain;  /* 防止滚动传播 */
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.content-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.content-container > h3,
.content-container > :deep(.post-header) {
  padding-left: 2.0rem;
  padding-right: 2.0rem;
}

.markdown-content {
  margin-top: 1rem;
  min-height: auto;  
  /* 移除任何可能导致内容无限增长的样式 */
  height: auto;
  overflow: visible;
  background: transparent;
}

.content-container > div:last-child {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* ======== 关闭按钮 ======== */
.close-button {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  z-index: 99999;
  backdrop-filter: blur(4px);
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* ======== markdown 内容区 ======== */
.markdown-content {
  margin-top: 1rem;
  min-height: auto;  
}

:deep(.markdown-content) {
  /* 移除markdown内容中多余的空白 */
  > *:first-child {
    margin-top: 0;
  }
  > *:last-child {
    margin-bottom: 0;
  }
}

:deep(.markdown-content) + div {
  margin-top: 1rem;
}

/* ======== 底部小圆点 ======== */
.dots-container {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中 */
  gap: 4px;
}

.dot-button {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

.dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #cfcfcf;
  transition: background-color 0.3s;
}

.dot.active {
  background-color: #666;
}

/* ======== 左右切换按钮（新增） ======== */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.15);
}
.nav-button.left {
  left: 16px;
}
.nav-button.right {
  right: 16px;
}

/* ======== 动画 ======== */
/* 左滑切换：当前卡片离场(-100%)，新卡片进场(100% -> 0) */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 二维码容器样式 */
.qr-code-container {
  margin: 0 auto;
  padding: 1rem;
  width: fit-content;
  backdrop-filter: blur(8px);
  @apply dark:bg-gray-800/80;
}

/* 二维码包装器样式 */
.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease;
  background: rgba(28, 28, 45, 0.1);
  padding: 0.75rem;
}

/* 为二维码添加悬停效果 */
.qr-code-wrapper:hover {
  transform: scale(1.02);
}
</style>