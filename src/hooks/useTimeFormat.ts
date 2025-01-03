export const useTimeFormat = () => {
  const formatTime = (timestamp: string | number) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000) // 转换为秒

    // 小于10秒
    if (diff < 10) {
      return '刚刚'
    }

    // 小于60秒
    if (diff < 60) {
      return `${diff}秒前`
    }

    // 小于60分钟
    const minutes = Math.floor(diff / 60)
    if (minutes < 60) {
      return `${minutes}分钟前`
    }

    // 小于24小时
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours}小时前`
    }

    // 小于7天
    const days = Math.floor(hours / 24)
    if (days < 7) {
      return `${days}天前`
    }

    // 小于30天
    if (days < 30) {
      return `${Math.floor(days / 7)}周前`
    }

    // 小于365天
    const months = Math.floor(days / 30)
    if (months < 12) {
      return `${months}个月前`
    }

    // 大于等于365天
    const years = Math.floor(days / 365)
    if (years >= 1) {
      if (years < 2) {
        return '1年前'
      } else {
        // 超过一年，显示完整日期时间
        const year = time.getFullYear()
        const month = String(time.getMonth() + 1).padStart(2, '0')
        const day = String(time.getDate()).padStart(2, '0')
        const hour = String(time.getHours()).padStart(2, '0')
        const minute = String(time.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
      }
    }

    return timestamp
  }

  return {
    formatTime
  }
}
