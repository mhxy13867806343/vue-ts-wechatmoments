import { ref } from 'vue'

export function useEmoji() {
  const emojiList = [
    { category: '表情', items: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'] },
    { category: '手势', items: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🙏', '🤝'] },
    { category: '心形', items: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'] },
    { category: '动物', items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'] },
    { category: '食物', items: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'] }
  ]

  const currentCategory = ref(emojiList[0].category)
  
  const setCategory = (category: string) => {
    currentCategory.value = category
  }

  const getCurrentEmojis = () => {
    return emojiList.find(cat => cat.category === currentCategory.value)?.items || []
  }

  const insertEmoji = (emoji: string, text: string, cursorPosition: number) => {
    const before = text.slice(0, cursorPosition)
    const after = text.slice(cursorPosition)
    return before + emoji + after
  }

  return {
    emojiList,
    currentCategory,
    setCategory,
    getCurrentEmojis,
    insertEmoji
  }
}
