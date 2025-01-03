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
}

export interface ILike {
  id: number
  user: IUser
  timestamp: string
}

export interface IMoment {
  id: number
  avatar: string
  username: string
  content: string
  timestamp: string
  likes: number
  likesList: ILike[]
  comments: number
  commentsList: IComment[]
  location?: string
  images?: string[]
  video?: string
  isPrivate?: boolean;
  isCurrentUser?: boolean // 新增字段，标识是否为当前用户的动态
}

export interface IPublishOptions {
  privacy: string;
  location: string;
  shareToThirdParty: boolean;
}
