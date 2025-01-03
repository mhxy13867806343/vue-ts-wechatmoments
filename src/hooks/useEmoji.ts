import { ref, computed } from 'vue'

// 表情分类
const categories = [
  { id: 'recent', name: '最近使用' },
  { id: 'face', name: '表情' },
  { id: 'hand', name: '手势' },
  { id: 'symbol', name: '符号' }
]

// 表情数据
const emojiData = {
  face: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'],
  hand: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '✋', '🤚', '👋', '🤜'],
  symbol: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
}

export function useEmoji() {
  const currentCategory = ref(categories[1].id) // 默认显示表情分类
  const recentEmojis = ref<string[]>([]) // 最近使用的表情

  // 获取当前分类的表情
  const getCurrentEmojis = computed(() => {
    if (currentCategory.value === 'recent') {
      return recentEmojis.value
    }
    return emojiData[currentCategory.value as keyof typeof emojiData] || []
  })

  // 切换分类
  const setCategory = (categoryId: string) => {
    currentCategory.value = categoryId
  }

  // 添加到最近使用
  const addToRecent = (emoji: string) => {
    if (!recentEmojis.value.includes(emoji)) {
      recentEmojis.value.unshift(emoji)
      if (recentEmojis.value.length > 16) { // 最多保存16个
        recentEmojis.value.pop()
      }
    }
  }

  // 在文本中插入表情
  const insertEmoji = (emoji: string, text: string, position: number) => {
    addToRecent(emoji)
    return text.slice(0, position) + emoji + text.slice(position)
  }

  return {
    categories,
    currentCategory,
    getCurrentEmojis,
    setCategory,
    insertEmoji
  }
}
