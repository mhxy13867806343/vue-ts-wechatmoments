import { defineStore } from 'pinia'
import { IUser } from '../types'

// 模拟用户数据
export const mockUsers: IUser[] = [
  {
    id: 1,
    name: 'Alice Chen',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  },
  {
    id: 2,
    name: 'Charlie Liu',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  },
  {
    id: 3,
    name: 'Bob Wang',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  }
]

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: mockUsers[0],  // 默认使用第一个用户
    users: mockUsers
  }),

  getters: {
    getCurrentUser(): IUser {
      return this.currentUser
    },
    
    getUsers(): IUser[] {
      return this.users
    }
  },

  actions: {
    setCurrentUser(userId: number) {
      const user = this.users.find(u => u.id === userId)
      if (user) {
        this.currentUser = user
      }
    }
  }
})
