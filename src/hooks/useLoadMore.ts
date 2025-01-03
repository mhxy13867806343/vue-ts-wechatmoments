import { ref } from 'vue'
import { showToast } from 'vant'
import type { IMoment } from '../types/moment'

export const useLoadMore = () => {
  const loading = ref(false)
  const refreshing = ref(false)
  const finished = ref(false)
  const pageSize = 10
  const currentPage = ref(1)

  // 模拟获取数据的延迟
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // 生成模拟数据
  const generateMockData = (page: number): IMoment[] => {
    return Array.from({ length: pageSize }, (_, index) => ({
      id: page * pageSize + index,
      avatar: `https://picsum.photos/100/100?random=${page * pageSize + index}`,
      username: `用户${page * pageSize + index}`,
      content: `这是第${page}页的第${index + 1}条动态内容`,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // 随机7天内的时间
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      location: '杭州市',
      images: Array.from({ length: Math.floor(Math.random() * 4) }, (_, i) => 
        `https://picsum.photos/300/300?random=${page * pageSize + index * 4 + i}`
      )
    }))
  }

  // 加载更多数据
  const onLoad = async () => {
    try {
      loading.value = true
      // 模拟网络请求延迟
      await delay(1000)

      // 模拟数据获取
      const newData = generateMockData(currentPage.value)
      
      // 模拟数据加载完成的情况
      if (currentPage.value >= 5) {
        finished.value = true
        return []
      }

      currentPage.value++
      return newData
    } catch (error) {
      showToast({
        message: '加载失败，请重试',
        type: 'fail',
      })
      return []
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const onRefresh = async () => {
    try {
      refreshing.value = true
      // 重置状态
      currentPage.value = 1
      finished.value = false
      
      // 模拟网络请求延迟
      await delay(1000)

      // 返回第一页数据
      return generateMockData(0)
    } catch (error) {
      showToast({
        message: '刷新失败，请重试',
        type: 'fail',
      })
      return []
    } finally {
      refreshing.value = false
    }
  }

  return {
    loading,
    refreshing,
    finished,
    onLoad,
    onRefresh
  }
}
