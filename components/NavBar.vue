<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
    <div class="container mx-auto px-4">
      <div class="flex items-center h-16">
        <!-- 左侧品牌 -->
        <NuxtLink 
          to="/" 
          class="flex items-center text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors whitespace-nowrap shrink-0"
        >
          <span>AGI Hunt</span>
        </NuxtLink>

        <!-- 中间的选择器组 -->
        <div class="flex items-center space-x-1 md:space-x-3 mx-auto">
          <DomainSelector />
          <DatePicker />
          <!-- <LangSelector /> -->
        </div>

        <div class="flex items-center space-x-4">
          <!-- 排序切换按钮 -->
          <div class="flex h-7 sm:h-8 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
            <button
              class="px-3 sm:px-4 transition-colors duration-200 ease-out relative min-w-[2.5rem] sm:min-w-[3rem] font-semibold"
              :class="!sortStore.sortByHot ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'"
              @click="sortStore.sortByHot = false"
            >
              新
            </button>
            <div class="w-px bg-gray-200"></div>
            <button
              class="px-3 sm:px-4 transition-colors duration-200 ease-out relative min-w-[2.5rem] sm:min-w-[3rem] font-semibold"
              :class="sortStore.sortByHot ? 'bg-rose-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30'"
              @click="sortStore.sortByHot = true"
            >
              热
            </button>
          </div>

          <!-- 右侧用户菜单 -->
          <div class="relative shrink-0">
            <button
              @click.stop="handleUserClick"
              class="flex items-center space-x-3 focus:outline-none group"
            >
              <div class="flex items-center space-x-2">
                <img
                  :src="userStore.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'"
                  alt="User Avatar"
                  class="w-8 h-8 rounded-full ring-2 ring-gray-200 group-hover:ring-primary transition-all shadow-sm"
                />
              </div>
            </button>

            <!-- QR Code Modal -->
            <div v-if="showQRModal" class="fixed inset-0 z-50">
              <div class="absolute inset-0 bg-black/50"></div>
              <div class="relative min-h-screen flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl ring-1 ring-gray-200/50">
                  <div class="p-6">
                    <div class="text-center mb-8">
                      <h3 class="text-2xl font-semibold text-gray-900">{{ isQRCodeForLogin ? '微信登录' : '微信支付' }}</h3>
                      <p class="text-base text-gray-600 mt-2">{{ isQRCodeForLogin ? '请使用微信扫码登录' : '请使用微信扫码支付' }}</p>
                    </div>
                    
                    <div class="flex flex-col items-center">
                      <div class="bg-white p-3 rounded-xl shadow-md ring-1 ring-gray-100 mb-6">
                        <QRCode 
                          :value="qrCodeUrl" 
                          :size="200" 
                          level="H"
                          class="rounded"
                        />
                      </div>
                      
                      <div class="flex items-center space-x-3 mb-8">
                        <div v-if="isLoading" class="flex items-center space-x-2 text-primary">
                          <div class="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                          <span class="text-sm">等待扫码...</span>
                        </div>
                        <div v-else class="text-sm text-gray-600">
                          {{ isQRCodeForLogin ? '扫码后自动登录' : '支付成功后请刷新页面' }}
                        </div>
                      </div>

                      <button
                        @click="closeQRModal"
                        class="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-base font-medium border border-gray-200"
                      >
                        {{ isQRCodeForLogin ? '取消登录' : '取消支付' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户菜单 -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 border dark:border-gray-700"
              @click.stop
            >
              <div class="px-4 py-3 border-b">
                <div 
                  @click="!userStore.isVip && handleSubscribe()"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 py-2 rounded-lg transition-colors"
                >
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ userStore.isVip ? '已订阅' : '待订阅' }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ userStore.isVip ? `VIP过期时间：${formatDate(userStore.vipExpire)}` : '现在开始订阅' }}
                  </div>
                </div>
              </div>
              
              <div class="py-1">
                <div class="relative">
                  <a
                    @mouseenter="handleContactHover(true)"
                    @mouseleave="handleContactHover(false)"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <span class="w-5 h-5 mr-3 text-gray-400 flex items-center justify-center">💬</span>
                    联系我
                  </a>
                  <!-- Contact QR Code -->
                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <div
                      v-if="showContactQR"
                      @mouseenter="handleContactHover(true)"
                      @mouseleave="handleContactHover(false)"
                      class="fixed left-1/2 -translate-x-1/2 top-20 bg-white rounded-xl shadow-xl p-4 z-50 w-[280px] mx-4 contact-qr-hover-area"
                      style="max-width: calc(100vw - 2rem);"
                    >
                      <div class="relative">
                        <!-- 标题 -->
                        <div class="text-center mb-3">
                          <h3 class="text-sm font-medium text-gray-900">微信联系我</h3>
                          <p class="text-xs text-gray-500 mt-1">扫描下方二维码添加好友</p>
                        </div>
                        <!-- 二维码 -->
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <img
                            src="https://img.cuckoos.info/gpt/wechat.jpg"
                            alt="Contact QR"
                            class="w-full h-auto object-cover rounded-lg shadow-sm"
                          />
                        </div>
                        <!-- 提示文本 -->
                        <div class="text-center mt-3">
                          <p class="text-xs text-gray-500">期待与您交流</p>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
                
                <a
                  v-if="!isInWechat"
                  @click="handleLogout"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <span class="w-5 h-5 mr-3 text-gray-400 flex items-center justify-center">🚪</span>
                  退出登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { useSortStore } from '~/stores/sort'
import { useUIStore } from '~/stores/ui'
import { useDropdownStore } from '~/stores/dropdown'
import { isWechat, generateToken } from '~/utils/auth'
import QRCode from 'qrcode.vue'
import { getWxPayInfo } from '~/api/payment'
import Swal from 'sweetalert2'

const userStore = useUserStore()
const sortStore = useSortStore()
const uiStore = useUIStore()
const dropdownStore = useDropdownStore()

// 组件ID
const DROPDOWN_ID = 'user-menu'

// 使用 dropdown store 来控制菜单显示
const showUserMenu = computed(() => {
  console.log('activeDropdown:', dropdownStore.activeDropdown)
  console.log('DROPDOWN_ID:', DROPDOWN_ID)
  console.log('Should show:', dropdownStore.activeDropdown === DROPDOWN_ID)
  return dropdownStore.activeDropdown === DROPDOWN_ID
})

const showQRModal = ref(false)
const showContactQR = ref(false)
const isQRCodeForLogin = ref(true)
const qrCodeUrl = ref('')
const isLoading = ref(false)
let refreshInterval = null

// 是否在微信浏览器中
const isInWechat = computed(() => isWechat())

// Format date
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

// Handle user avatar click
const handleUserClick = () => {
  console.log('handleUserClick')
  console.log('openid:', userStore.openid)
  if (!userStore.openid || userStore.openid === 'guest') {
    console.log('showing login QR')
    showLoginQRCode()
  } else {
    console.log('toggling menu')
    console.log('current activeDropdown:', dropdownStore.activeDropdown)
    dropdownStore.setActiveDropdown(dropdownStore.activeDropdown === DROPDOWN_ID ? null : DROPDOWN_ID)
    console.log('new activeDropdown:', dropdownStore.activeDropdown)
  }
}

// Show login QR code
const showLoginQRCode = () => {
  isQRCodeForLogin.value = true
  const qrcodeToken = generateToken()
  const currentUrl = window.location.href
  qrCodeUrl.value = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}qrcodeToken=${qrcodeToken}`
  showQRModal.value = true
  uiStore.setModalBackdrop(true)
  isLoading.value = true
  startPolling(qrcodeToken)
}

// Start polling for login status
const startPolling = (qrcodeToken) => {
  refreshInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/login/qrcode/login/refresh/${qrcodeToken}`)
      const data = await response.json()
      
      if (data.data?.openid) {
        userStore.setOpenid(data.data.openid)
        closeQRModal()
        window.location.reload()
      }
    } catch (error) {
      console.error('Error polling login status:', error)
    }
  }, 5000)
}

// Handle subscription
const handleSubscribe = async () => {
  dropdownStore.setActiveDropdown(null) // Close user menu first
  
  const result = await Swal.fire({
    title: '加入 AGI Hunt',
    html: `
      <div class="text-left">
        <div class="mb-4">
          <div class="text-xl font-bold">¥99/年（仅 ¥0.27/天）</div>
          <div class="text-sm text-gray-500">早期会员特惠，每增加100人将上调20元</div>
        </div>
        <div class="space-y-3">
          <div class="font-medium">AI 智能资讯聚合</div>
          <div class="text-sm">
            📊 每天监控 6000+ 条大V 及行业前沿AI 内容
            <br>🤖 多个AI agents 挑选、审核、翻译、总结
            <br>⏱️ 每天节省 800+ 小时阅读时间
            <br>🎯 全网AI 内容一网打尽，看这里就够了
            <br>⚡️ 分钟级监控，快人一步，掌控AI！
          </div>
          <div class="font-medium">AI 开源与研究追踪</div>
          <div class="text-sm">
            💻 每天精选 10+ 热门/新兴 GitHub AI开源项目
            <br>📑 每天解读 20+ arxiv平台AI前沿论文
          </div>
          <div class="mt-4 pt-3 border-t border-gray-200">
            <div class="font-medium mb-2">为什么选择收费？</div>
            <div class="text-sm text-gray-600 space-y-2">
              <div>🔄 让系统能更长期、稳定运转</div>
              <div>👥 鱼龙混杂❌，AI 同路人✅</div>
              <div>🔒 避免敏感，保护用户信息</div>
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '立即加入',
    cancelButtonText: '暂不加入',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    width: '32em'
  })

  if (result.isConfirmed) {
    if (isWechat()) {
      initiateWechatPayment()
    } else {
      showSubscribeQRCode()
    }
  }
}

// Show subscribe QR code
const showSubscribeQRCode = () => {
  isQRCodeForLogin.value = false
  const currentUrl = window.location.href
  qrCodeUrl.value = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}trigSubscribe=1`
  showQRModal.value = true
  uiStore.setModalBackdrop(true)
}

// Initiate WeChat payment
const initiateWechatPayment = async () => {
  const loadingAlert = Swal.fire({
    title: '正在处理支付请求...',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    const data = await getWxPayInfo(userStore.openid)
    loadingAlert.close()

    if (data.code === 1 && data.data && data.data.payInfo) {
      const payParams = {
        ...data.data.payInfo,
        timeStamp: data.data.payInfo.timeStamp.toString()
      }
      console.log('Pay params:', payParams)
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        payParams,
        function(res) {
          console.log('Pay response:', res)
          if (res.err_msg === "get_brand_wcpay_request:ok") {
            const language = document.documentElement.lang || 'zh'
            window.location.href = `https://agihunt.cuckoos.info/feeds/ai/${language}`
          } else {
            console.error('WeChat pay failed:', res.err_msg)
            Swal.fire({
              icon: 'error',
              title: '支付未完成',
              text: '支付过程中出现问题，请稍后重试',
              timer: 3000,
              showConfirmButton: false
            })
          }
        }
      )
    } else {
      console.error('Invalid payment info:', data)
      Swal.fire({
        icon: 'error',
        title: '获取支付信息失败',
        text: '系统暂时无法处理您的支付请求，请稍后再试',
        timer: 3000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    loadingAlert.close()
    console.error('Error initiating payment:', error)
    Swal.fire({
      icon: 'error',
      title: '支付请求失败',
      text: '网络连接出现问题，请检查网络后重试',
      timer: 3000,
      showConfirmButton: false
    })
  }
}

// Close QR modal
const closeQRModal = () => {
  showQRModal.value = false
  uiStore.setModalBackdrop(false)
  isLoading.value = false
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Handle logout
const handleLogout = () => {
  userStore.clearUserData()
  window.location.reload()
}

// 处理联系我的悬停
function handleContactHover(isHover) {
  if (isHover) {
    showContactQR.value = true;
  } else {
    // 添加一个小延迟，避免鼠标移动到二维码时触发关闭
    setTimeout(() => {
      if (!document.querySelector(':hover > .contact-qr-hover-area')) {
        showContactQR.value = false;
      }
    }, 100);
  }
}

// Clean up
onMounted(() => {
  // Add global click listener to close dropdowns
  document.addEventListener('click', () => {
    dropdownStore.closeAll()
  })
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  document.removeEventListener('click', () => {
    dropdownStore.closeAll()
  })
})
</script>
