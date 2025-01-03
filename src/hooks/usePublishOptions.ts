import { ref, computed } from 'vue'
import { showToast } from 'vant'
import type { ActionSheetAction } from 'vant'

export interface UsePublishOptionsProps {
  onLocationSelect?: (location: string) => void
  onVisibilitySelect?: (visibility: string) => void
  onFriendsSelect?: (friends: string[]) => void
}

export const usePublishOptions = (props: UsePublishOptionsProps = {}) => {
  // 位置选择
  const showLocationSheet = ref(false)
  const selectedLocation = ref<string>('')
  const locationText = ref('选择位置')

  // 使用 computed 来动态生成带高亮的 actions
  const locationActions = computed(() => {
    return [
      { name: '北京市朝阳区' },
      { name: '上海市浦东新区' },
      { name: '广州市天河区' },
      { name: '深圳市南山区' },
      { name: '杭州市西湖区' }
    ].map(action => ({
      ...action,
      className: selectedLocation.value === action.name ? 'van-action-sheet__item--active' : ''
    }))
  })

  // 可见性选择
  const showVisibilitySheet = ref(false)
  const selectedVisibility = ref('公开')
  const visibilityText = ref('公开')
  
  // 使用 computed 来动态生成带高亮的 actions
  const visibilityActions = computed(() => {
    return [
      { name: '公开' },
      { name: '仅好友可见' },
      { name: '仅自己可见' }
    ].map(action => ({
      ...action,
      className: selectedVisibility.value === action.name ? 'van-action-sheet__item--active' : ''
    }))
  })

  // 好友选择
  const showFriendSheet = ref(false)
  const selectedFriends = ref<string[]>([])
  const friendText = ref('选择好友')
  
  // 使用 computed 来动态生成带高亮的 actions
  const friendActions = computed(() => {
    return [
      { name: '张三' },
      { name: '李四' },
      { name: '王五' },
      { name: '赵六' }
    ].map(action => ({
      ...action,
      className: selectedFriends.value.includes(action.name) ? 'van-action-sheet__item--active' : ''
    }))
  })

  // 设置初始状态
  const setInitialState = (draft: { visibility?: string, remindFriends?: string | string[], location?: string }) => {
    if (draft.visibility) {
      selectedVisibility.value = draft.visibility
      visibilityText.value = draft.visibility
    }
    if (draft.remindFriends) {
      const friends = typeof draft.remindFriends === 'string' 
        ? draft.remindFriends.split(',')
        : draft.remindFriends
      selectedFriends.value = friends
      friendText.value = friends.length ? friends.join(',') : '选择好友'
    }
    if (draft.location) {
      selectedLocation.value = draft.location
      locationText.value = draft.location
    }
  }

  // 处理位置选择
  const handleLocationClick = () => {
    showLocationSheet.value = true
  }

  const onSelectLocation = (action: ActionSheetAction) => {
    selectedLocation.value = action.name
    locationText.value = action.name
    showLocationSheet.value = false
    showToast({
      message: `已选择位置：${action.name}`,
      position: 'bottom'
    })
    props.onLocationSelect?.(action.name)
  }

  // 处理可见性选择
  const handleVisibilityClick = () => {
    showVisibilitySheet.value = true
  }

  const onSelectVisibility = (action: ActionSheetAction) => {
    selectedVisibility.value = action.name
    visibilityText.value = action.name
    showVisibilitySheet.value = false
    showToast({
      message: `已设置为${action.name}`,
      position: 'bottom'
    })
    props.onVisibilitySelect?.(action.name)
  }

  // 处理好友选择
  const handleFriendClick = () => {
    showFriendSheet.value = true
  }

  const onSelectFriend = (action: ActionSheetAction) => {
    const index = selectedFriends.value.indexOf(action.name)
    if (index > -1) {
      selectedFriends.value.splice(index, 1)
    } else {
      selectedFriends.value.push(action.name)
    }
    friendText.value = selectedFriends.value.length ? selectedFriends.value.join(',') : '选择好友'
    props.onFriendsSelect?.(selectedFriends.value)
  }

  return {
    // 位置相关
    showLocationSheet,
    selectedLocation,
    locationText,
    locationActions,
    handleLocationClick,
    onSelectLocation,

    // 可见性相关
    showVisibilitySheet,
    selectedVisibility,
    visibilityText,
    visibilityActions,
    handleVisibilityClick,
    onSelectVisibility,

    // 好友相关
    showFriendSheet,
    selectedFriends,
    friendText,
    friendActions,
    handleFriendClick,
    onSelectFriend,

    // 设置初始状态
    setInitialState
  }
}
