<template>
  <div class="post-header flex flex-wrap items-center gap-2 mb-3 pb-2 border-gray-100 dark:border-gray-700 desktop:px-6 desktop:py-4">
    <!-- User info with avatar -->
    <div class="flex items-center">
      <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-1.5 flex-shrink-0">
        <img 
          :src="post.avatar || 'https://www.gravatar.com/avatar/?d=mp'" 
          :alt="post.author"
          class="w-full h-full object-cover"
          @error="handleAvatarError"
        />
      </div>
      <span 
        class="font-medium text-gray-900 dark:text-white truncate"
        :class="usernameFontClass"
        :title="post.author"
      >
        @{{ post.author }}
      </span>
    </div>
    <!-- Follower count -->
    <div class="flex items-center text-gray-600 dark:text-gray-400 text-sm">
      <span class="w-4 h-4 flex items-center justify-center leading-none">👥</span>
      <span class="ml-0.5">
        {{ formatFollowerCount(post.followerCount) }}
      </span>
    </div>
    <!-- Date -->
    <time
      :datetime="post.createDate"
      class="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs"
    >
      {{ formatTime(post.createDate) }}
    </time>
    <!-- Hot value (moved to end) -->
    <div class="flex items-center text-orange-500 ml-auto text-sm">
      <span class="w-4 h-4 flex items-center justify-center leading-none">🔥</span>
      <span class="ml-0.5">{{ formatHotValue }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '~/utils/date'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatTime = (date) => formatDate(date, 'YYYY-MM-DD HH:mm')

const formatFollowerCount = (count) => {
  if (!count) return 0
  return count >= 10000 ? (count / 10000).toFixed(1) + 'w' : count
}

const formatHotValue = computed(() => {
  if (!props.post?.hotValue) return 0
  return Math.round(props.post.hotValue * 100)
})

const usernameFontClass = computed(() => {
  const length = props.post.author?.length || 0
  if (length > 15) {
    return 'text-xs max-w-[150px]'
  } else if (length > 10) {
    return 'text-sm max-w-[180px]'
  }
  return 'text-sm max-w-[200px]'
})

const handleAvatarError = (e) => {
  // Fallback to default avatar if GitHub avatar fails to load
  e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
}
</script>

<style scoped>
.flex-wrap {
  margin-top: 1rem;
}
</style>
