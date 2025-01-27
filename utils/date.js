import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化时间，根据时间距离现在的长短返回不同的格式
 * @param {string|Date} date 要格式化的日期
 * @param {boolean} [showTime=false] 是否显示具体时间
 * @returns {string} 格式化后的字符串
 */
export const formatDate = (date, showTime = false) => {
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')
  const diffWeeks = now.diff(target, 'week')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  if (diffWeeks < 4) return `${diffWeeks}周前`
  
  const timeFormat = showTime ? ' HH:mm' : ''
  if (target.year() === now.year()) {
    return target.format(`M月D日${timeFormat}`)
  }
  return target.format(`YYYY年M月D日${timeFormat}`)
}

export default {
  formatDate
}
