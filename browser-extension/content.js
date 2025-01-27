// 标记脚本已注入
window.cardCaptureInjected = true;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startCapture') {
    captureCard().then(sendResponse)
    return true // 保持消息通道开放
  }
})

// 创建并显示进度指示器
function createProgressIndicator() {
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 999999;
    transition: opacity 0.3s;
  `
  document.body.appendChild(indicator)
  return indicator
}

// 更新进度提示
function updateProgress(indicator, text) {
  indicator.textContent = text
}

// 等待Twitter内容加载
async function waitForTwitterLoad(timeout = 10000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const twitterFrame = document.querySelector('iframe[data-tweet-id]')
    if (twitterFrame && twitterFrame.offsetHeight > 100) {
      // 额外等待一秒确保内容完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000))
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return false
}

// 等待指定元素加载
async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector)
    if (element) return element
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  throw new Error(`Timeout waiting for element: ${selector}`)
}

// 创建截图容器
function createCaptureContainer() {
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  `
  
  const content = document.createElement('div')
  content.style.cssText = `
    position: relative;
    background: transparent;
    border-radius: 12px;
    overflow: visible;
  `
  
  container.appendChild(content)
  document.body.appendChild(container)
  return { container, content }
}

// 复制计算样式
function copyComputedStyles(source, target) {
  const computedStyle = window.getComputedStyle(source)
  for (const property of computedStyle) {
    try {
      target.style[property] = computedStyle.getPropertyValue(property)
    } catch (e) {
      // 忽略不支持的属性
    }
  }
}

// 复制背景层
function copyBackgroundLayers(source, target) {
  // 复制背景层
  const bgLayer = source.querySelector('.absolute.inset-0.bg-white')
  if (bgLayer) {
    const newBgLayer = bgLayer.cloneNode(true)
    copyComputedStyles(bgLayer, newBgLayer)
    newBgLayer.style.position = 'absolute'
    target.insertBefore(newBgLayer, target.firstChild)
  }

  // 复制pattern层
  const patternLayer = source.querySelector('.absolute.inset-0.pattern-overlay')
  if (patternLayer) {
    const newPatternLayer = patternLayer.cloneNode(true)
    copyComputedStyles(patternLayer, newPatternLayer)
    newPatternLayer.style.position = 'absolute'
    target.insertBefore(newPatternLayer, target.firstChild)
  }
}

async function captureCard() {
  const progress = createProgressIndicator()
  let originalScroll = window.scrollY
  let captureContainer = null
  
  try {
    // 查找卡片和父元素
    updateProgress(progress, '查找卡片...')
    const innerCard = document.querySelector('[data-v-b5aa60c0].relative.h-full')
    if (!innerCard) {
      throw new Error('未找到可截图的卡片')
    }

    // 获取父元素（desktop-card）
    const desktopCard = innerCard.closest('.desktop-card')
    if (!desktopCard) {
      throw new Error('未找到卡片容器')
    }

    // 等待Twitter内容加载
    updateProgress(progress, '等待Twitter内容加载...')
    await waitForTwitterLoad()

    // 创建截图容器
    updateProgress(progress, '准备截图...')
    const { container, content } = createCaptureContainer()
    captureContainer = container

    // 创建新的卡片容器
    const newDesktopCard = document.createElement('div')
    newDesktopCard.className = desktopCard.className // 保持原始类名
    
    // 复制所有计算样式
    copyComputedStyles(desktopCard, newDesktopCard)
    
    // 确保关键样式正确设置
    newDesktopCard.style.cssText += `
      position: relative;
      width: ${desktopCard.offsetWidth}px;
      margin: 0;
      transform: none;
      transition: none;
      overflow: hidden;
    `

    // 复制背景层
    copyBackgroundLayers(desktopCard, newDesktopCard)

    // 克隆内部卡片
    const cardClone = innerCard.cloneNode(true)
    
    // 复制所有计算样式
    copyComputedStyles(innerCard, cardClone)
    
    // 确保关键样式正确设置
    cardClone.style.cssText += `
      position: relative;
      width: 100%;
      height: auto;
      min-height: 0;
      margin: 0;
      transform: none;
      transition: none;
      overflow: visible;
    `

    // 组装卡片
    newDesktopCard.appendChild(cardClone)
    content.appendChild(newDesktopCard)

    // 显示容器并等待内容重新渲染
    container.style.display = 'flex'
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 获取实际尺寸
    const contentHeight = newDesktopCard.scrollHeight
    const contentWidth = newDesktopCard.offsetWidth
    const viewportHeight = window.innerHeight - 40 // 留出一些边距
    
    // 计算缩放比例
    const scale = Math.min(1, viewportHeight / contentHeight)
    
    // 应用缩放
    newDesktopCard.style.transform = `scale(${scale})`
    newDesktopCard.style.transformOrigin = 'top center'
    
    // 调整容器大小以精确匹配内容
    content.style.height = (contentHeight * scale) + 'px'
    content.style.width = (contentWidth * scale) + 'px'

    // 等待变换完成
    await new Promise(resolve => setTimeout(resolve, 500))

    // 截图
    updateProgress(progress, '正在截图...')
    const response = await chrome.runtime.sendMessage({
      action: 'captureTab'
    })

    if (!response || response.error) {
      throw new Error('截图失败：' + (response?.error || '未知错误'))
    }

    // 下载图片
    updateProgress(progress, '准备下载...')
    const title = cardClone.querySelector('h3')?.textContent || 'card'
    const filename = `${title.slice(0, 50).trim()}.png`
    
    const link = document.createElement('a')
    link.download = filename
    link.href = response.dataUrl
    link.click()

    updateProgress(progress, '截图完成！')
    setTimeout(() => progress.remove(), 2000)

    return { status: 'success' }
  } catch (error) {
    console.error('Capture error:', error)
    updateProgress(progress, '出错：' + error.message)
    setTimeout(() => progress.remove(), 3000)
    return { status: 'error', message: error.message }
  } finally {
    // 清理
    if (captureContainer) {
      captureContainer.remove()
    }
    window.scrollTo(0, originalScroll)
  }
}
