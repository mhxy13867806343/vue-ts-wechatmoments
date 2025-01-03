import { ref, computed } from 'vue'

export function useTimeAgo() {
  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) {
      return '刚刚'
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}分钟前`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours}小时前`
    }

    const days = Math.floor(hours / 24)
    if (days < 30) {
      return `${days}天前`
    }

    const months = Math.floor(days / 30)
    if (months < 12) {
      return `${months}个月前`
    }

    const years = Math.floor(days / 365)
    return `${years}年前`
  }

  return {
    getTimeAgo
  }
}
