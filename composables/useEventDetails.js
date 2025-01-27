import { ref, onMounted, onUnmounted } from 'vue'

export function useEventDetails({ onClose, onPrevious, onNext }) {
  // 触摸相关状态
  const touchStart = ref({ x: 0, y: 0 })
  const slideOffset = ref(0)
  const slideDirection = ref(null)
  const isMobile = ref(false)
  const isAnimating = ref(false)
  const slideProgress = ref(0)

  // 处理触摸开始
  const handleTouchStart = (e) => {
    touchStart.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    slideOffset.value = 0
    slideDirection.value = null
    isAnimating.value = false
  }

  // 处理触摸移动
  const handleTouchMove = (e) => {
    if (!touchStart.value) return

    const deltaX = e.touches[0].clientX - touchStart.value.x
    const deltaY = e.touches[0].clientY - touchStart.value.y

    // 如果垂直滑动距离大于水平滑动距离，不处理
    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    slideOffset.value = deltaX
    slideDirection.value = deltaX > 0 ? 'left' : 'right'
    slideProgress.value = Math.min(Math.abs(deltaX) / window.innerWidth, 1)
  }

  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!slideDirection.value) return

    isAnimating.value = true
    const threshold = window.innerWidth * 0.3

    if (Math.abs(slideOffset.value) > threshold) {
      // 切换到下一张/上一张
      if (slideDirection.value === 'left') {
        onPrevious()
      } else {
        onNext()
      }
    }

    // 重置状态
    touchStart.value = null
    slideOffset.value = 0
    slideDirection.value = null
    slideProgress.value = 0
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }

  // 监听 ESC
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft') {
      onPrevious()
    } else if (e.key === 'ArrowRight') {
      onNext()
    }
  }

  // 检查是否为移动设备
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    window.removeEventListener('resize', checkMobile)
  })

  return {
    touchStart,
    slideOffset,
    slideDirection,
    isMobile,
    isAnimating,
    slideProgress,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    checkMobile
  }
}
