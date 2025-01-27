1. 参考下面的逻辑在整个网站中实现init() 的功能
```
function isWechat() {
    return /MicroMessenger/i.test(navigator.userAgent);
}


function getUrlParamAndRemove(param) {
    const url = new URL(window.location.href);
    const value = url.searchParams.get(param);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url);
    return value ? value : null;
}


function redirect4WXCode() {
    // 获取当前页面地址
    let currentUrl = window.location.href;
    // 对当前页面地址进行 URL 编码
    let encodedUrl = encodeURIComponent(currentUrl);
    // 构造新的 URL 字符串
    let newUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb8f3b3a83e59d5eb&redirect_uri=" + encodedUrl + "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
    // 进行页面跳转
    window.location.href = newUrl;
}


function fetchOpenid(code) {
    // 不做cache
    fetch(`/api/openid/${code}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 1) {
            // 清空本地所有存储
            set to store: openid = data.data.openid
            location.reload();
        } else {
            alert: {
                title: '出错了！',
                text:  data.msg,
                icon: 'warning',
                confirmButtonText: '确定'
            };
        }
    })
    .catch(error => console.error('Error:', error));
}


function getOpenid() {
    if store 中有 openid:
        return openid
    if !isWechat():
        return 'guest'
    code = getUrlParamAndRemove('code')
    if !code:
        redirect4WXCode()
    else:
        fetchOpenid(code)
}

function processQrcodeToken(openid) {
    判断参数中是否有qrcodeToken <- getUrlParamAndRemove('qrcodeToken')
    if qrcodeToken:
        调用服务端接口: 
            header: X-Openid: openid
            url:/api/login/qrcode/<qrcodeToken>
        if error:
            show alert
}

function processTrigSubscribe() {
    判断参数中是否有trigSubscribe <- getUrlParamAndRemove('trigSubscribe')
    if trigSubscribe 有，且值为1:
        弹出微信支付的流程
}

function getUserInfo(openid) {
    // 5分钟时长的cache
    if openid == 'guest':
        设置store 中userinfo为 并触发components/NavBar.vue 中用户头像及菜单部分的数据更新逻辑：
         {
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=guest',
            isVip: 0,
            vipExpire: null
        }
    调用服务端接口:
    header: X-Openid: openid
    url:/api/userinfo
    if error:
        show alert
    else:
        设置store 中userinfo为 并触发components/NavBar.vue 中用户头像及菜单部分的数据更新逻辑：
         {
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=<openid>',
            isVip: data.data.isVip, // 0 or 1
            vipExpire: data.data.vipExpire // datetime string
        }
        同时，如果isVip 为0，则弹出微信支付的流程（见微信支付流程）
}

function getDataUrl(openid) {
    domain, date, language = parse path: /feeds/<domain>/<date>/<language>, or /feeds/<domain>/<date>/<eventId>/<tpostId>/<language>, e.g.: /feeds/ai/2024-03-23/zh, /feeds/ai/2024-03-23/23432/2/zh

    // store 进行cache: 重复的domain, date, language 会返回上一次的dataUrl

    # 请求要带上 openid 在header 中，字段为 X-Openid
    fetch by api: /api/getdataUrl/<domain>/<date>/<language>
    if error:
        show alert
    else:
        return url <- data.data.url
}


function getData(openid) {
    dataUrl = getDataUrl()

    // store 进行cache: 重复的dataUrl 会返回上一次的数据

    fetch by api: /<dataUrl>
    if error:
        show alert
    else:
        return data
}


function init() {
    openid = getOpenid()
    processQrcodeToken(openid)
    getUserInfo(openid)
    data = getData(openid)
}

init()
```

1. 在components/NavBar.vue 中调整用户菜单相关逻辑：
- 用户头像的种子使用openid
- 如果openid 为'guest'
  - 注意：这说明不是在微信里打开
  - 若点击，则弹出登录二维码
  - 二维码对应为网址：当前页面的location.href 再加上一个由js 生成一个随机字符串参数qrcodeToken=<随机字符串>
  - 同时提示用户用微信扫码(此时微信端会走processQrcodeToken 的逻辑将Openid 通知服务端)
  - 同时显示一个正在加载中的动效
  - 同时每5秒轮询向服务端的接口 /api/login/qrcode/login/refresh/<qrcodeToken>，若能data.data.openid 有值，则登录成功，
  - 登录成功则走下面的逻辑：
    - set to store: openid = data.data.openid;
    - location.reload(); 
- 如果openid 不为'guest'
  - 点击后弹出菜单，菜单内容参考store 中userinfo 的信息，逻辑为：
    - “账号”改为对应的用户名，用户名的逻辑为：
      - if isVip == 1:
        - 已订阅
      - else:
        - 待订阅
    - “即将推出…”改为vip 过期时间
      - if isVip == 1:
        - VIP过期时间（显示日期）
      - else:
        - VIP未开通
    - “账号”和“过期时间”卡片的点击逻辑：
      - if isVip == 1:
        - 无点击效果
      - else:
        - 点击后走弹出微信支付的流程（见微信支付流程）
    - 再下面展示一个菜单：“联系我”
      - 点击或hover 后在其下方弹出网站管理员的微信二维码：https://pbs.twimg.com/profile_images/1333449867474120704/4NImokbV_400x400.png
      - 二维码不用太大，要美观
      - hover 移走或点击其他地方后，二维码消失
    - 再下面展示一个菜单“退出登录”
      - 点击“退出登录”后:
        - set to store: openid = 'guest'
        - location.reload();
- 对于getUserInfo(openid) 设置到store 中的用户信息，并触发数据更新逻辑:
  - 头像使用avatarUrl
  - vip信息使用isVip
  - vipExpire


1. 微信支付流程
- 如果在微信里打开
  - 调用服务端接口 /api/subscribe/wxpay/payinfo 获取支付信息
  - triggerWechatPay(data.data.payInfo, data.data.taskId)
  - triggerWechatPay 的逻辑如下：
    function triggerWechatPay(payData, taskId) {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', payData,
            function (res) {
                if (res.err_msg === "get_brand_wcpay_request:ok") {
                    window.location.href = `https://agihunt.cuckoos.info/feeds/ai/<language>`; // language 为当前语言，为en, ja, zh 之一，都不是则用zh
                } else {
                    alert: {
                        title: '支付失败',
                        text: '请稍后重试',
                        icon: 'warning',
                        confirmButtonText: '确定'
                    };
                }
            });
    }
- 如果不在微信里打开
  - 弹出二维码，并提示：用微信扫码支持
  - 二维码对应为一个网址：当前页面的location.href 再加上一个由js 生成一个随机字符串参数trigSubscribe=1
  - 提示用户:
    - 用微信扫码进行支付
    - 支付成功后请刷新页面


注意：
1. 如果有逻辑不一致或是不完善的，请结合在微信中及非微信中的逻辑进行合理优化，并给出代码实现
2. 包安装用pnpm，逻辑用js不是ts
3. 不要用Swal.fire，用合适的组件
4. 相关的视觉、动效交互要保持与整体项目的一致性，要好看，高级，不花哨