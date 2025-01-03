<template>
  <div class="publish">
    <van-nav-bar
      title="发布动态"
      left-text="取消"
      right-text="发布"
      @click-left="handleCancel"
      @click-right="handlePublish"
    />
    
    <van-field
      v-model="draft.content"
      rows="5"
      autosize
      type="textarea"
      maxlength="140"
      placeholder="这一刻的想法..."
      show-word-limit
    />
    
    <van-uploader
      v-model="fileList"
      multiple
      :max-count="9"
      :before-read="beforeRead"
      :after-read="afterRead"
      @delete="handleDelete"
      :accept="'.jpg,.jpeg,.png,.gif,.mp4'"
    />

    <div class="options">
      <van-cell title="所在位置" :value="locationText" is-link @click="handleLocation" />
      <van-cell title="谁可以看" :value="visibilityText" is-link @click="handleVisibilityClick" />
      <van-cell title="提醒谁看" :value="friendText" is-link @click="handleFriendClick" />
    </div>

    <van-action-sheet
      v-model:show="showLocationSheet"
      :actions="locationActions"
      @select="onSelectLocation"
      cancel-text="取消"
      close-on-click-action
    />

    <van-action-sheet
      v-model:show="showVisibilitySheet"
      :actions="visibilityActions"
      @select="onSelectVisibility"
      cancel-text="取消"
      close-on-click-action
    />

    <van-action-sheet
      v-model:show="showFriendSheet"
      :actions="friendActions"
      @select="onSelectFriend"
      cancel-text="取消"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, computed, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { usePublishDraft } from '../hooks/usePublishDraft'
import { useMediaUpload } from '../hooks/useMediaUpload'
import { usePublishOptions } from '../hooks/usePublishOptions'
import type { UploaderFileListItem } from 'vant'
import type { NavigationGuard } from 'vue-router'

const router = useRouter()
const isUnmounting = ref(false)

const {
  draft,
  updateDraft,
  saveDraft,
  clearDraft,
  checkCanPublish,
  handleExit,
  loadDraft
} = usePublishDraft()

// 文件列表
const fileList = ref<UploaderFileListItem[]>([])

// 初始化时，从 draft 加载已有的图片
watch(() => draft.value.images, (newImages) => {
  if (newImages && newImages.length > 0 && fileList.value.length === 0) {
    fileList.value = newImages.map(item => ({
      ...item,
      url: item.content || item.url // 优先使用 content 作为 url
    }))
  }
}, { immediate: true })

// 监听文件列表变化，更新 draft
watch(fileList, (newFiles) => {
  if (JSON.stringify(newFiles) !== JSON.stringify(draft.value.images)) {
    console.log('文件列表变化:', newFiles)
    // 保存时保留 content
    const updatedFiles = newFiles.map(file => ({
      ...file,
      content: file.content || file.url, // 如果有 content 就用 content，否则用 url
      url: file.content || file.url
    }))
    updateDraft({ images: updatedFiles })
    saveDraft() // 立即保存到本地
  }
}, { deep: true })

// 检查是否有内容
const hasContent = computed(() => {
  const hasText = Boolean(draft.value.content.trim())
  const hasImages = fileList.value.length > 0
  console.log('内容状态:', { hasText, hasImages })
  return hasText || hasImages
})

const {
  beforeRead,
  afterRead,
  maxSize
} = useMediaUpload()

const {
  showLocationSheet,
  locationActions,
  handleLocationClick,
  onSelectLocation,
  showVisibilitySheet,
  visibilityText,
  visibilityActions,
  handleVisibilityClick,
  onSelectVisibility,
  showFriendSheet,
  friendText,
  friendActions,
  handleFriendClick,
  onSelectFriend,
  setInitialState,
  locationText
} = usePublishOptions({
  onLocationSelect: (location) => {
    updateDraft({ location })
  },
  onVisibilitySelect: (visibility) => {
    updateDraft({ visibility })
  },
  onFriendsSelect: (friends) => {
    updateDraft({ remindFriends: friends })
  }
})

// 处理文件删除
const handleDelete = (file: UploaderFileListItem) => {
  console.log('删除文件:', file)
  const index = fileList.value.findIndex(f => f.url === file.url || f.url === file.content)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
  
  // 清理 blob URL
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url)
  }
}

// 处理位置变化
const handleLocation = () => {
  console.log('选择位置')
  handleLocationClick()
}

// 添加 watch 来监听位置变化并保存
watch(() => draft.value.location, (newLocation) => {
  if (newLocation && newLocation !== '选择位置') {
    console.log('位置变化，保存草稿:', newLocation)
    saveDraft()
  }
})

// 添加 watch 来监听可见性变化并保存
watch(() => draft.value.visibility, (newVisibility) => {
  if (newVisibility) {
    console.log('可见性变化，保存草稿:', newVisibility)
    saveDraft()
  }
})

// 处理取消
const handleCancel = async () => {
  console.log('点击取消按钮')
  if (!hasContent.value) {
    console.log('没有内容，直接返回')
    router.push('/')
    return
  }
  const exitResult = await handleExit()
  console.log('取消操作结果:', exitResult)
  if (exitResult) {
    router.push('/')
  }
}

// 处理发布
const handlePublish = async () => {
  console.log('点击发布按钮')
  if (!checkCanPublish()) return
  
  try {
    // TODO: 这里添加发布逻辑
    const success = true // 模拟发布成功
    
    if (success) {
      clearDraft()  // 只在发布成功后清除草稿
      router.push('/')
    }
  } catch (error) {
    console.error('发布失败:', error)
  }
}

// 加载草稿
onMounted(() => {
  loadDraft()
  if (draft.value) {
    setInitialState({
      location: draft.value.location,
      visibility: draft.value.visibility,
      remindFriends: draft.value.remindFriends
    })
  }
})

// 窗口关闭时不自动保存
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasContent.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  isUnmounting.value = true
})
</script>

<style scoped>
.publish {
  min-height: 100vh;
  background: #f7f8fa;
}

.options {
  margin-top: 12px;
}

:deep(.van-action-sheet__item--active) {
  color: var(--van-primary-color);
}
</style>
