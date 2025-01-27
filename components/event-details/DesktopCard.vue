<template>
  <div
    v-if="post"
    class="rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden desktop-card mx-auto"
    :class="{
      'w-[min(800px,40vw)] h-[90vh]': isSelectedState,
      'w-[280px] h-[420px] cursor-pointer': !isSelectedState
    }"
    :style="{
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isSelectedState ? 'scale(1)' : 'scale(1)',
      opacity: 1
    }"
  >
    <!-- 背景层 -->
    <div 
      class="absolute inset-0 bg-white dark:bg-gray-800 transition-all duration-500"
      :style="{ 
        background: getGradientBackground(post.title, isSelectedState ? 0.85 : 0.7),
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }"
    ></div>

    <!-- Pattern overlay -->
    <div 
      v-if="shouldShowPattern(post.title)"
      class="absolute inset-0 pattern-overlay transition-all duration-500"
      :class="[getPatternClass(post.title), { 'opacity-5': isSelectedState, 'opacity-10': !isSelectedState }]"
      :style="{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }"
    ></div>

    <!-- 统一的滚动容器 -->
    <div 
      class="relative h-full transition-all duration-500"
      :class="{ 'overflow-y-auto': isSelectedState }"
      :style="{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }"
      @click="!isSelectedState && $emit('select')"
    >
      <!-- 内容包装器 -->
      <div :class="{ 'h-full': !isSelectedState, 'p-6': isSelectedState }">
        <!-- 关闭按钮 -->
        <button
          v-if="isSelectedState"
          @click.stop="$emit('close')"
          class="fixed right-4 top-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow hover:bg-white dark:hover:bg-gray-700 transition-all"
        >
          <span class="text-gray-600 dark:text-gray-300">✕</span>
        </button>

        <!-- 小卡片布局 -->
        <template v-if="!isSelectedState">
          <div class="h-full flex flex-col">
            <div class="flex-1 flex items-center justify-center px-4">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white text-center line-clamp-5 leading-relaxed">
                {{ post.title }}
              </h3>
            </div>
            
            <div class="flex flex-col items-center space-y-2 px-4 pb-8">
              <img
                :src="post.avatar || 'https://www.gravatar.com/avatar/?d=mp'"
                :alt="post.author"
                class="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-600"
              />
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                @{{ post.author }}
              </span>
              <div class="text-sm text-gray-900 dark:text-white">
                {{ formatFollowerCount(post.followerCount) }} 粉丝
              </div>
            </div>
          </div>
        </template>

        <!-- 大卡片布局 -->
        <template v-else>
          <div class="space-y-6">
            <!-- 标题 -->
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ post.title }}
            </h3>

            <!-- 作者信息 -->
            <PostHeader :post="post" />
            
            <!-- Markdown 内容 -->
            <div 
              v-if="post.content"
              class="prose prose-sm dark:prose-invert max-w-none bg-white/50 dark:bg-gray-800/50 rounded-lg p-4"
              v-html="renderedContent"
            />
            
            <!-- Twitter 嵌入 -->
            <div v-if="post.tpostUrl" class="mt-4">
              <TweetEmbed :tpost-url="post.tpostUrl" />
            </div>

            <!-- 其他元数据 -->
            <div v-if="post.metadata" class="space-y-2">
              <div v-for="(value, key) in post.metadata" :key="key" class="text-sm">
                <span class="text-gray-500 dark:text-gray-400">{{ key }}: </span>
                <span class="text-gray-700 dark:text-gray-200">{{ value }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import PostHeader from './PostHeader.vue'
import TweetEmbed from './TweetEmbed.vue'
import { getGradientBackground, shouldShowPattern, getPatternClass } from '~/utils/colorUtils'

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const isSelectedState = ref(props.isSelected)

// 提供给父组件的方法，用于更新选中状态
const setSelected = (value) => {
  isSelectedState.value = value
}

// 监听 props 中的 isSelected 变化
watch(() => props.isSelected, (newValue) => {
  isSelectedState.value = newValue
})

// 将组件实例暴露给父组件
defineExpose({
  setSelected
})

// Markdown 渲染
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
  return md.render(props.post.content)
})

function formatFollowerCount(count) {
  if (count < 1000) return count
  if (count < 10000) return `${Math.floor(count / 1000)}k`
  return `${Math.floor(count / 10000)}w`
}
</script>

<style scoped>
:deep(.markdown-content) {
  /* 移除最大高度限制 */
  /* max-height: calc(80vh - 300px); */
  /* overflow-y: auto; */
}

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
    transparent 8px
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

/* Markdown 内容样式 */
:deep(.prose) {
  color: inherit;
}

:deep(.prose pre) {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
}

:deep(.prose code) {
  color: inherit;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
}

:deep(.prose a) {
  color: #3b82f6;
  text-decoration: none;
}

:deep(.prose a:hover) {
  text-decoration: underline;
}

:deep(.prose img) {
  border-radius: 0.5rem;
  margin: 1rem 0;
}

:deep(.prose blockquote) {
  border-left-color: currentColor;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

/* 暗色模式适配 */
:deep(.dark .prose) {
  color: inherit;
}

:deep(.dark .prose pre) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark .prose code) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark .prose blockquote) {
  background-color: rgba(255, 255, 255, 0.05);
}

.desktop-card {
  backface-visibility: hidden;
  transform-style: preserve-3d;
  will-change: transform, width, height;
}

.pattern-overlay {
  pointer-events: none;
  will-change: opacity;
}
</style>
