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
  replyTo?: IUser
}

export interface ILike {
  id: number
  user: IUser
  timestamp: string
}

export interface IMoment {
  id: number
  user: IUser
  content: string
  images?: string[]
  video?: string | null
  timestamp: string
  likes: ILike[]
  comments: IComment[]
  location?: string
  isPrivate?: boolean
}

export interface IPublishOptions {
  privacy: string
  location: string
  shareToThirdParty: boolean
}
