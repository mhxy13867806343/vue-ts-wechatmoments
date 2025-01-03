import { ref } from 'vue'
import { showToast } from 'vant'
import type { IMoment } from '../types/moment'

export interface ShareOption {
  name: string
  icon: string
}

export const useShare = () => {
  const showShare = ref(false)
  const currentMoment = ref<IMoment | null>(null)

  const shareOptions: ShareOption[] = [
    { name: '微信', icon: 'wechat' },
    { name: '朋友圈', icon: 'wechat-moments' },
    { name: 'QQ', icon: 'qq' },
    { name: '微博', icon: 'weibo' },
    { name: '复制链接', icon: 'link' },
    { name: '分享海报', icon: 'poster' },
    { name: '二维码', icon: 'qrcode' },
  ]

  const showShareSheet = (moment: IMoment) => {
    currentMoment.value = moment
    showShare.value = true
  }

  const onSelectSharePlatform = (option: ShareOption) => {
    const content = currentMoment.value?.content || ''
    showToast({
      message: `已分享到${option.name}：${content}`,
      position: 'bottom',
      duration: 2000,
    })
    showShare.value = false
  }

  return {
    showShare,
    shareOptions,
    showShareSheet,
    onSelectSharePlatform
  }
}
