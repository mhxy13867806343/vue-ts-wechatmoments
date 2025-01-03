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
      likesList: [
        { id: 1, user: mockUsers[1], timestamp: new Date(Date.now() - 1800000).toISOString() },
        { id: 2, user: mockUsers[2], timestamp: new Date(Date.now() - 1700000).toISOString() }
      ],
      comments: [
        {
          id: 1,
          user: mockUsers[1],
          content: 'Great sharing! The TypeScript session was my favorite 👍',
          timestamp: new Date(Date.now() - 1600000).toISOString()
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
              timestamp: new Date(Date.now() - 1400000).toISOString()
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
      likesList: [
        { id: 3, user: mockUsers[0], timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 4, user: mockUsers[3], timestamp: new Date(Date.now() - 3500000).toISOString() },
        { id: 5, user: mockUsers[4], timestamp: new Date(Date.now() - 3400000).toISOString() }
      ],
      comments: []
    },
    {
      id: 3,
      user: mockUsers[2],
      content: 'Check out my new coding tutorial video! 💻 Learning Vue 3 has never been easier.',
      images: [],
      video: 'https://example.com/demo-video.mp4',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      likesList: [],
      comments: [
        {
          id: 4,
          user: mockUsers[4],
          content: 'Thanks for sharing! Very helpful tutorial 🙏',
          timestamp: new Date(Date.now() - 5400000).toISOString()
        }
      ]
    }
  ]
}

export const useMomentsStore = defineStore('moments', {
  state: () => ({
    moments: generateDemoMoments(),
    loading: false,
    refreshing: false
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

    async publishMoment(content: string, images: string[] = [], video: string | null = null) {
      const newMoment: IMoment = {
        id: this.moments.length + 1,
        user: mockUsers[0], // Current user
        content,
        images,
        video,
        timestamp: new Date().toISOString(),
        likesList: [],
        comments: []
      }
      this.moments.unshift(newMoment)
    }
  }
})
