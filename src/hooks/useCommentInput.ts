import { ref } from 'vue'
import type { IMoment } from '../types/moment'
import { showToast, showNotify } from 'vant'

export function useCommentInput() {
  const showCommentInput = ref(false)
  const commentText = ref('')
  const replyToUser = ref<{ name: string; id: number } | null>(null)
  const currentMomentId = ref<number | null>(null)

  const openCommentInput = (moment: IMoment, replyTo?: { name: string; id: number }) => {
    currentMomentId.value = moment.id
    if (replyTo) {
      replyToUser.value = replyTo
    } else {
      replyToUser.value = null
    }
    showCommentInput.value = true
  }

  const closeCommentInput = () => {
    showCommentInput.value = false
    commentText.value = ''
    replyToUser.value = null
    currentMomentId.value = null
  }

  const submitComment = () => {
    if (!commentText.value.trim()) {
      showToast('评论内容不能为空')
      return
    }
    
    // TODO: 实际提交评论的逻辑
    console.log('提交评论:', {
      momentId: currentMomentId.value,
      replyTo: replyToUser.value,
      content: commentText.value
    })
    
    closeCommentInput()
    showNotify({ 
      type: 'success',
      message: replyToUser.value ? '回复成功' : '评论成功'
    })
  }

  return {
    showCommentInput,
    commentText,
    replyToUser,
    currentMomentId,
    openCommentInput,
    closeCommentInput,
    submitComment
  }
}
