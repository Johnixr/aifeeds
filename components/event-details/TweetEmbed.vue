<template>
  <div v-if="tpostUrl" class="mt-6 min-h-[200px]" ref="tweetContainer">
    <div class="flex items-center justify-center h-[200px]">
      <div class="animate-pulse">
        <span class="w-8 h-8 text-primary-500 flex items-center justify-center leading-none">🐦</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  tpostUrl: {
    type: String,
    default: ''
  }
})

const tweetContainer = ref(null)

const loadTweet = async () => {
  if (!props.tpostUrl || !tweetContainer.value) return

  try {
    const tweetId = props.tpostUrl.split('/').pop()
    if (!tweetId) return

    // 确保 Twitter widgets 脚本已加载
    if (!window.twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      document.head.appendChild(script)
      await new Promise(resolve => script.onload = resolve)
    }

    // 清空容器
    tweetContainer.value.innerHTML = ''
    
    // 嵌入推文
    window.twttr.widgets.createTweet(tweetId, tweetContainer.value, {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      lang: 'zh-cn',
      dnt: false,
      conversation: 'none',
      cards: 'visible',
      align: 'center',
      enableAutoTranslate: true
    })
  } catch (error) {
    console.error('Failed to load tweet:', error)
  }
}

watch(() => props.tpostUrl, loadTweet)

onMounted(loadTweet)
</script>
