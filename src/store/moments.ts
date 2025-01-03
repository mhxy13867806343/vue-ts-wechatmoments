import { defineStore } from 'pinia'
import type { IMoment } from '../types/moment'

// 生成测试图片数组
const generateImages = (count: number) => {
  return Array.from({ length: count }, (_, index) => 
    `https://picsum.photos/300/300?random=${Date.now() + index}`
  )
}

// 生成测试数据
const generateMockData = (): IMoment[] => {
  const contents = [
    "今天天气真不错，出去玩了一天！",
    "新的一年，新的开始！",
    "和朋友聚会真开心！",
    "学习新技术中...",
    "周末去爬山，感觉太棒了！"
  ]

  // 随机选择2个索引作为当前用户的动态
  const currentUserIndices = new Set<number>()
  while (currentUserIndices.size < 2) {
    currentUserIndices.add(Math.floor(Math.random() * 5))
  }

  return Array.from({ length: 5 }, (_, index) => ({
    id: Date.now() + index,
    avatar: `https://picsum.photos/40/40?random=${index}`,
    username: currentUserIndices.has(index) ? '当前用户' : `用户${index + 1}`,
    content: contents[index],
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    likes: Math.floor(Math.random() * 50) + 1,
    comments: Math.floor(Math.random() * 20) + 1,
    images: Math.random() > 0.5 ? generateImages(Math.floor(Math.random() * 9) + 1) : [],
    likesList: [], // 这里会在 Home.vue 中填充
    commentsList: [], // 这里会在 Home.vue 中填充
    isCurrentUser: currentUserIndices.has(index) // 标记是否为当前用户的动态
  }))
}

export const useMomentsStore = defineStore('moments', {
  state: () => ({
    moments: generateMockData()
  }),
  
  actions: {
    addMoment(moment: IMoment) {
      this.moments.unshift(moment)
    },
    
    addMoments(moments: IMoment[]) {
      this.moments.push(...moments)
    },
    
    setMoments(moments: IMoment[]) {
      this.moments = moments
    },
    
    clearMoments() {
      this.moments = []
    },

    // 初始化或刷新数据
    refreshData() {
      this.moments = generateMockData()
    },

    // 删除动态
    deleteMoment(momentId: number) {
      const index = this.moments.findIndex(m => m.id === momentId)
      if (index !== -1) {
        this.moments.splice(index, 1)
      }
    },

    // 发布动态
    publishMoment(data: { content: string; images?: string[]; video?: string | null }) {
      const newMoment: IMoment = {
        id: Date.now(),
        avatar: 'https://picsum.photos/40/40?random=current',
        username: '当前用户',
        content: data.content,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        images: data.images || [],
        video: data.video || null,
        likesList: [],
        commentsList: [],
        isCurrentUser: true
      }
      
      this.moments.unshift(newMoment)
      return newMoment
    }
  }
})
