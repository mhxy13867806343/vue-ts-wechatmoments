import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const usePublish = () => {
  const router = useRouter()
  const pressTimer = ref<number | null>(null)

  const startTimer = () => {
    pressTimer.value = setTimeout(() => {
      router.push('/publish?type=text')
    }, 800)
  }

  const endTimer = () => {
    if (pressTimer.value) {
      clearTimeout(pressTimer.value)
      pressTimer.value = null
    }
  }

  const handlePublish = () => {
    router.push('/publish')
  }

  return {
    pressTimer,
    startTimer,
    endTimer,
    handlePublish
  }
}
