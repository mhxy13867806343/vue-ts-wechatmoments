import { defineStore } from 'pinia'
import type { IMoment, IUser, IComment, ILike } from '../types/moment'

// Mock users data
const mockUsers: IUser[] = [
  { id: 1, name: 'Alice Chen', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 2, name: 'Bob Wang', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 3, name: 'Charlie Liu', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 4, name: 'David Zhang', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 5, name: 'Eva Lin', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' }
]

// Generate demo moments
const generateDemoMoments = (): IMoment[] => {
  return [
    {
      id: 1,
      user: mockUsers[0],
      content: 'Just visited the amazing Vue.js Conference! 🎉 The talks about Composition API and TypeScript were incredibly insightful. #vuejs #typescript',
      images: [
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      ],
      video: null,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: [],
      comments: [
        {
          id: 1,
          user: mockUsers[1],
          content: 'Great sharing! The TypeScript session was my favorite 👍',
          timestamp: new Date(Date.now() - 1600000).toISOString(),
          replies: []
        },
        {
          id: 2,
          user: mockUsers[2],
          content: 'Wish I could be there! Next time for sure 😊',
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          replies: [
            {
              id: 3,
              user: mockUsers[0],
              content: '@Charlie Liu You should definitely come next time!',
              timestamp: new Date(Date.now() - 1400000).toISOString(),
              replyTo: mockUsers[2]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      user: mockUsers[1],
      content: 'Beautiful sunset at the beach 🌅 Perfect end to a perfect day.',
      images: [
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      ],
      video: null,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: [],
      comments: []
    }
  ]
}

export const useMomentsStore = defineStore('moments', {
  state: () => ({
    moments: generateDemoMoments(),
    loading: false,
    refreshing: false,
    currentUser: mockUsers[0] // 当前用户
  }),

  actions: {
    async refreshMoments() {
      this.refreshing = true
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.moments = generateDemoMoments()
      this.refreshing = false
    },

    async loadMoreMoments() {
      this.loading = true
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newMoments = generateDemoMoments().map(moment => ({
        ...moment,
        id: moment.id + this.moments.length
      }))
      this.moments.push(...newMoments)
      this.loading = false
    },

    setMoments(moments: IMoment[]) {
      this.moments = moments
    },

    // 发布新动态
    async publishMoment(content: string, images: string[] = [], video: string | null = null) {
      const newMoment: IMoment = {
        id: this.moments.length + 1,
        user: this.currentUser,
        content,
        images,
        video,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
      }
      this.moments.unshift(newMoment)
    },

    // 添加评论或回复
    addComment(momentId: number, content: string, replyTo?: { id: number; name: string }, parentCommentId?: number) {
      const moment = this.moments.find(m => m.id === momentId)
      if (!moment || !moment.comments) return

      const newComment: IComment = {
        id: Date.now(),
        user: this.currentUser!,
        content,
        timestamp: new Date().toISOString(),
        replies: [],
        replyTo
      }

      // 如果指定了父评论ID，说明是回复其他评论
      if (parentCommentId) {
        const parentComment = moment.comments.find(c => c.id === parentCommentId)
        if (parentComment) {
          if (!parentComment.replies) parentComment.replies = []
          parentComment.replies.push(newComment)
          return
        }
      }

      // 如果没有父评论ID或找不到父评论，添加为主评论
      moment.comments.push(newComment)
    },

    // 点赞/取消点赞
    toggleLike(momentId: number) {
      const moment = this.moments.find(m => m.id === momentId)
      if (!moment) return

      const userLikeIndex = moment.likes.findIndex(like => like.user.id === this.currentUser.id)
      if (userLikeIndex === -1) {
        // 添加点赞
        moment.likes.push({
          id: Date.now(),
          user: this.currentUser,
          timestamp: new Date().toISOString()
        })
      } else {
        // 取消点赞
        moment.likes.splice(userLikeIndex, 1)
      }
    }
  }
})
