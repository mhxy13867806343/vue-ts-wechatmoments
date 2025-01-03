import { ref, onUnmounted } from 'vue'
import { formatDate } from '../utils/dateFormat'

export function useTimeAgo(timestamp: string) {
  const timeAgo = ref('')
  let animationFrameId: number

  const updateTimeAgo = () => {
    const now = new Date()
    const past = new Date(timestamp)
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diff < 10) {
      timeAgo.value = '刚刚'
      // 3秒后更新为具体秒数
      animationFrameId = requestAnimationFrame(() => {
        if (diff < 60) {
          timeAgo.value = `${diff}秒前`
        }
      })
      return
    }

    if (diff < 60) {
      timeAgo.value = `${diff}秒前`
      // 继续更新直到超过60秒
      animationFrameId = requestAnimationFrame(updateTimeAgo)
      return
    }

    if (diff < 3600) {
      timeAgo.value = `${Math.floor(diff / 60)}分钟前`
      return
    }

    if (diff < 86400) {
      timeAgo.value = `${Math.floor(diff / 3600)}小时前`
      return
    }

    if (diff < 2592000) {
      timeAgo.value = `${Math.floor(diff / 86400)}天前`
      return
    }

    if (diff < 31536000) {
      timeAgo.value = `${Math.floor(diff / 2592000)}个月前`
      return
    }

    // 使用格式化函数来确保跨平台兼容性
    timeAgo.value = formatDate(past)
  }

  // 初始更新
  updateTimeAgo()

  // 组件卸载时清除动画帧
  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  return {
    timeAgo
  }
}
