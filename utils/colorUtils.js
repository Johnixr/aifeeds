// 基于字符串生成稳定的随机数（0-1之间）
export function seededRandom(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  // 使用正弦函数将hash转换为0-1之间的小数
  const rand = Math.abs(Math.sin(hash) * 10000) % 1
  return rand
}

// 基于seed获取特定范围内的随机整数
export function seededRandomInt(str, max) {
  return Math.floor(seededRandom(str) * max)
}

// 将十六进制颜色转换为 RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// 将 RGB 转换为十六进制颜色
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// 调整颜色的亮度
function adjustBrightness(hex, factor) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  // 将 RGB 值调整为更亮
  const r = Math.min(255, rgb.r + (255 - rgb.r) * factor)
  const g = Math.min(255, rgb.g + (255 - rgb.g) * factor)
  const b = Math.min(255, rgb.b + (255 - rgb.b) * factor)

  return rgbToHex(r, g, b)
}

// 精心挑选的柔和配色方案
export const colorPalettes = [
  // 柔和现代色
  ['#FF6B6B', '#4ECDC4'],   // 珊瑚红配薄荷绿
  ['#6C5CE7', '#A8E6CF'],   // 深紫配淡绿
  ['#45B7D1', '#FEF9EF'],   // 天蓝配米白
  ['#FF9F68', '#E0F4FF'],   // 橙色配淡蓝
  
  // 渐变色系
  ['#74EBD5', '#ACB6E5'],   // 绿松石渐变
  ['#FAD961', '#F76B1C'],   // 日落渐变
  ['#7F7FD5', '#91EAE4'],   // 紫蓝渐变
  ['#FFE259', '#FFA751'],   // 金橙渐变
  
  // 柔和暖色
  ['#FF9A9E', '#FAD0C4'],   // 粉红渐变
  ['#FF8C69', '#FFB6C1'],   // 珊瑚橙粉
  ['#FFA07A', '#FFE4E1'],   // 浅鲑鱼色
  ['#FFB88C', '#FFE4B5'],   // 杏色渐变
  
  // 柔和冷色
  ['#48C6EF', '#6F86D6'],   // 天蓝渐变
  ['#4FACFE', '#00F2FE'],   // 蓝绿渐变
  ['#43E97B', '#38F9D7'],   // 薄荷渐变
  ['#A8EDEA', '#FED6E3'],   // 薄荷粉渐变
]

// 获取基于title的随机渐变角度
export function getRandomAngle(title) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return angles[seededRandomInt(title, angles.length)]
}

// 获取基于title的随机颜色对
export function getRandomColorPair(title) {
  const paletteIndex = seededRandomInt(title, colorPalettes.length)
  return colorPalettes[paletteIndex]
}

// 基于title确定是否显示纹理及纹理类型
export const patternTypes = ['dots', 'lines', 'grid', 'diagonal']

export function shouldShowPattern(title) {
  return seededRandom(title) > 0.3 // 70%的概率显示纹理
}

export function getPatternClass(title) {
  const patternIndex = seededRandomInt(title, patternTypes.length)
  return `pattern-${patternTypes[patternIndex]}`
}

// 获取基于title的渐变背景样式
export function getGradientBackground(title, brightness = 1) {
  const [color1, color2] = getRandomColorPair(title)
  const angle = getRandomAngle(title)

  if (brightness === 1) {
    return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`
  }

  // 调整颜色亮度
  const adjustedColor1 = adjustBrightness(color1, brightness)
  const adjustedColor2 = adjustBrightness(color2, brightness)
  return `linear-gradient(${angle}deg, ${adjustedColor1} 0%, ${adjustedColor2} 100%)`
}

// 获取带透明度的渐变背景
export function getGradientBackgroundWithOpacity(title, opacity = 1) {
  const [color1, color2] = getRandomColorPair(title)
  const angle = getRandomAngle(title)
  return `linear-gradient(${angle}deg, ${color1}${Math.floor(opacity * 255).toString(16)} 0%, ${color2}${Math.floor(opacity * 255).toString(16)} 100%)`
}
