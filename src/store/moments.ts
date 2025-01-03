import { defineStore } from 'pinia'
import { IMoment, IComment } from '../types'
import { useUserStore } from './user'

export const useMomentsStore = defineStore('moments', {
  state: () => ({
    moments: [] as IMoment[]
  }),

  getters: {
    getMoments(): IMoment[] {
      return this.moments
    }
  },

  actions: {
    // 生成演示数据
    generateDemoMoments() {
      const currentTime = new Date()
      const userStore = useUserStore()
      
      this.moments = [
        {
          id: 1,
          user: userStore.users[0],
          content: '今天参加了一个很棒的TypeScript分享会！学到了很多有趣的知识 ',
          images: ['https://picsum.photos/500/300?random=1'],
          timestamp: new Date(currentTime.getTime() - 30 * 60000).toISOString(), // 30分钟前
          likes: [],
          comments: []
        },
        {
          id: 2,
          user: userStore.users[1],
          content: '和朋友一起去爬山，感觉太棒了！',
          images: [
            'https://picsum.photos/500/300?random=2',
            'https://picsum.photos/500/300?random=3'
          ],
          timestamp: new Date(currentTime.getTime() - 60 * 60000).toISOString(), // 1小时前
          likes: [],
          comments: []
        },
        {
          id: 3,
          user: userStore.users[2],
          content: '刚做完一个很酷的项目，用到了Vue 3和TypeScript！',
          images: ['https://picsum.photos/500/300?random=4'],
          timestamp: new Date(currentTime.getTime() - 90 * 60000).toISOString(), // 1.5小时前
          likes: [],
          comments: []
        }
      ]

      // 添加一些演示评论
      this.addComment(1, '分享得很好！')
      setTimeout(() => {
        this.addComment(1, '下次也要参加！', { id: userStore.users[0].id, name: userStore.users[0].name })
      }, 100)
    },

    // 添加评论或回复
    addComment(momentId: number, content: string, replyTo?: { id: number; name: string }, parentCommentId?: number) {
      const moment = this.moments.find(m => m.id === momentId)
      const userStore = useUserStore()
      
      if (!moment) {
        console.error('Moment not found:', momentId)
        return
      }

      if (!userStore.currentUser) {
        console.error('No current user')
        return
      }

      // 确保 moment.comments 存在
      if (!moment.comments) {
        moment.comments = []
      }

      const newComment: IComment = {
        id: Date.now(),
        user: userStore.currentUser,
        content,
        timestamp: new Date().toISOString(),
        replies: [],
        replyTo
      }

      // 如果指定了父评论ID，说明是回复其他评论
      if (parentCommentId) {
        const parentComment = moment.comments.find(c => c.id === parentCommentId)
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(newComment)
        } else {
          console.error('Parent comment not found:', parentCommentId)
          moment.comments.push(newComment)
        }
      } else {
        // 如果没有父评论ID，添加为主评论
        moment.comments.push(newComment)
      }
    },

    // 点赞/取消点赞
    toggleLike(momentId: number) {
      const moment = this.moments.find(m => m.id === momentId)
      const userStore = useUserStore()
      
      if (!moment || !userStore.currentUser) {
        console.error('Invalid moment or user:', { momentId, currentUser: userStore.currentUser })
        return
      }

      const userId = userStore.currentUser.id
      const index = moment.likes.indexOf(userId)
      
      if (index === -1) {
        moment.likes.push(userId)
      } else {
        moment.likes.splice(index, 1)
      }
    },

    // 刷新动态列表
    refreshMoments() {
      this.generateDemoMoments()
    }
  }
})
