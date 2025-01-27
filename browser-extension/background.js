// 监听扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('localhost') || tab.url.includes('127.0.0.1')) {
    injectContentScript(tab.id);
  }
});

// 注入content script
async function injectContentScript(tabId) {
  try {
    // 检查脚本是否已经注入
    const [results] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.hasOwnProperty('cardCaptureInjected')
    });

    if (!results.result) {
      // 注入content script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    }
  } catch (error) {
    console.error('Script injection error:', error);
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureTab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' })
      .then(dataUrl => {
        sendResponse({ status: 'success', dataUrl });
      })
      .catch(error => {
        sendResponse({ status: 'error', error: error.message });
      });
    return true;
  }
});
