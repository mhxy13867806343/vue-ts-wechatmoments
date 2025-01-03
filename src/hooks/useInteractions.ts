import { ref } from 'vue'
import type { IUser, IComment, ILike } from '../types/moment'

// 使用 friendActions 数据
const mockUsers: IUser[] = [
  { id: 1, name: '张三', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 2, name: '李四', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 3, name: '王五', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 4, name: '赵六', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
  { id: 5, name: '钱七', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' }
]

// 生成随机点赞数据
const generateMockLikes = (count: number): ILike[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }))
}

// 生成随机评论数据
const generateMockComments = (count: number): IComment[] => {
  const comments = [
    "这也太好看了吧！",
    "厉害了我的哥！",
    "今天天气真不错",
    "约起来！",
    "下次一起去玩啊",
    "真羡慕你们啊",
    "这是在哪里拍的？",
    "我也想去！",
    "太有意思了",
    "学习了学习了"
  ]
  
  return Array.from({ length: count }, (_, index) => {
    const comment: IComment = {
      id: index + 1,
      user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      content: comments[Math.floor(Math.random() * comments.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }

    // 随机添加回复
    if (Math.random() > 0.5) {
      comment.replies = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, replyIndex) => ({
        id: (index + 1) * 100 + replyIndex,
        user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        content: comments[Math.floor(Math.random() * comments.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }))
    }

    return comment
  })
}

export const useInteractions = () => {
  const showLikesList = ref(false)
  const expandedCommentIds = ref<number[]>([])
  const currentMomentId = ref<number | null>(null)
  
  // 处理点赞列表
  const handleLikesClick = (momentId: number) => {
    currentMomentId.value = momentId
    showLikesList.value = true
  }
  
  // 处理评论展开/收起
  const toggleComments = (momentId: number) => {
    const index = expandedCommentIds.value.indexOf(momentId)
    if (index === -1) {
      expandedCommentIds.value.push(momentId)
    } else {
      expandedCommentIds.value.splice(index, 1)
    }
  }
  
  // 检查评论是否展开
  const isCommentsExpanded = (momentId: number) => {
    return expandedCommentIds.value.includes(momentId)
  }
  
  // 关闭点赞列表
  const closeLikesList = () => {
    showLikesList.value = false
    currentMomentId.value = null
  }
  
  return {
    showLikesList,
    expandedCommentIds,
    currentMomentId,
    handleLikesClick,
    toggleComments,
    isCommentsExpanded,
    closeLikesList,
    generateMockLikes,
    generateMockComments
  }
}
