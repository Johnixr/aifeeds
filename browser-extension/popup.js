document.getElementById('captureBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status')
  const btn = document.getElementById('captureBtn')
  
  try {
    btn.disabled = true
    statusEl.textContent = '正在准备截图...'

    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    // 检查是否在正确的页面
    if (!tab.url.includes('localhost') && !tab.url.includes('127.0.0.1')) {
      throw new Error('请在本地开发环境使用此扩展')
    }

    // 注入content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      })
    } catch (error) {
      // 如果脚本已经注入，会抛出错误，我们可以忽略它
      console.log('Script might already be injected:', error)
    }

    // 等待一小段时间确保脚本已加载
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 执行截图
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'startCapture' })
    
    if (response.status === 'success') {
      statusEl.textContent = '截图完成！'
      setTimeout(window.close, 1000)
    } else {
      throw new Error(response.message || '未找到可截图的卡片')
    }
  } catch (error) {
    console.error('Error:', error)
    statusEl.textContent = '错误：' + error.message
  } finally {
    btn.disabled = false
  }
})
