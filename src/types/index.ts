export interface IUser {
  id: number
  name: string
  avatar: string
}

export interface IComment {
  id: number
  user: IUser
  content: string
  timestamp: string
  replies?: IComment[]
  replyTo?: {
    id: number
    name: string
  }
}

export interface IMoment {
  id: number
  user: IUser
  content: string
  images?: string[]
  video?: string
  timestamp: string
  likes: number[]
  comments: IComment[]  // 确保这是必需的字段，不是可选的
}
