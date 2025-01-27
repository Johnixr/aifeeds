<template>
  <div class="relative w-full">
    <!-- 使用动态高度的容器 -->
    <div 
      ref="containerRef"
      class="relative w-full" 
      :style="containerStyle"
    >
      <div class="relative w-full h-full">
        <!-- 背景层 -->
        <div
          class="absolute inset-0"
          :style="backgroundStyle"
        ></div>
        
        <!-- Pattern overlay -->
        <div 
          v-if="!shouldShowRealImage && shouldShowPattern"
          class="absolute inset-0 pattern-overlay"
          :class="patternClass"
        ></div>
        
        <!-- Gradient overlay -->
        <div 
          v-show="!shouldShowRealImage"
          class="absolute inset-0" 
          :style="gradientStyle"
        ></div>

        <!-- 内容层 -->
        <div
          v-show="!shouldShowRealImage"
          class="relative w-full h-full flex items-center justify-center px-4 py-6"
        >
          <div class="max-w-[80%]">
            <h3 class="text-base md:text-lg font-medium text-center text-white drop-shadow-lg break-words">{{ title }}</h3>
          </div>
        </div>

        <!-- Actual image -->
        <img
          v-if="src"
          ref="imageRef"
          v-show="shouldShowRealImage"
          :src="src"
          :alt="title"
          class="w-full object-contain object-top"
          :style="imageStyle"
          @load="handleLoad"
          @error="handleError"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { seededRandom, seededRandomInt, colorPalettes } from '~/utils/colorUtils'

const props = defineProps({
  src: {
    type: String,
    required: false,
    default: ''
  },
  title: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['load', 'error'])
const imageRef = ref(null)
const containerRef = ref(null)
const imageLoaded = ref(false)
const error = ref(false)
const imageRatio = ref(0) // 图片宽高比
const containerWidth = ref(0) // 容器宽度

const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
  }
}

const handleLoad = () => {
  const img = imageRef.value
  if (img) {
    imageRatio.value = img.naturalWidth / img.naturalHeight
    updateContainerWidth()
  }
  imageLoaded.value = true
  error.value = false
  emit('load')
}

const handleError = () => {
  error.value = true
  imageLoaded.value = false
  emit('error')
}

// 计算是否应该尝试显示实际图片
const shouldShowRealImage = computed(() => {
  return props.src && imageLoaded.value && !error.value
})

// 计算容器样式
const containerStyle = computed(() => {
  if (!containerWidth.value) return {}
  
  // 如果没有图片或图片加载失败，使用固定高度
  if (!shouldShowRealImage.value) {
    return {
      height: '200px'
    }
  }
  
  // 如果有图片，根据图片比例计算高度
  const height = containerWidth.value / imageRatio.value
  return {
    height: `${height}px`
  }
})

const imageStyle = computed(() => {
  if (!containerWidth.value) return {}
  
  const height = containerWidth.value / imageRatio.value
  return {
    height: `${height}px`
  }
})

// 获取基于title的随机渐变角度
function getRandomAngle(title) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return angles[seededRandomInt(title, angles.length)]
}

// 获取基于title的随机颜色对
function getRandomColorPair(title) {
  const paletteIndex = seededRandomInt(title, colorPalettes.length)
  return colorPalettes[paletteIndex]
}

// 基于title确定是否显示纹理及纹理类型
const patternTypes = ['dots', 'lines', 'grid', 'diagonal']
const shouldShowPattern = computed(() => {
  return seededRandom(props.title) > 0.3 // 70%的概率显示纹理
})

const patternClass = computed(() => {
  if (!shouldShowPattern.value) return ''
  const patternIndex = seededRandomInt(props.title, patternTypes.length)
  return `pattern-${patternTypes[patternIndex]}`
})

const backgroundStyle = computed(() => {
  const [color1, color2] = getRandomColorPair(props.title)
  const angle = getRandomAngle(props.title)
  return {
    background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`,
    opacity: shouldShowRealImage.value ? 0 : 1
  }
})

const gradientStyle = computed(() => {
  const [color1, color2] = getRandomColorPair(props.title + '_gradient')
  const angle = getRandomAngle(props.title + '_gradient')
  return {
    background: `linear-gradient(${angle}deg, 
      ${color1}00 0%, 
      ${color1}55 25%, 
      ${color2}99 100%)`
  }
})
</script>

<style scoped>
.pattern-overlay {
  pointer-events: none;
}

.pattern-dots {
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 16px 16px;
}

.pattern-lines {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 1px,
    transparent 1px,
    transparent 8px
  );
}

.pattern-grid {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 16px 16px;
}

.pattern-diagonal {
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 1px,
    transparent 1px,
    transparent 10px
  );
}
</style>
