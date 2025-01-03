import { ref, onMounted, shallowRef } from 'vue'
import { showToast, showDialog } from 'vant'
import { UploaderFileListItem } from 'vant'

const DRAFT_KEY = 'MOMENT_DRAFT'

export interface PublishDraft {
  content: string
  images: UploaderFileListItem[]
  location?: string
  visibility?: string    // 可见性设置
  remindFriends?: string[]  // 提醒好友列表
}

const defaultDraft: PublishDraft = {
  content: '',
  images: [],
  location: '选择位置',
  visibility: '公开',
  remindFriends: []
}

export function usePublishDraft() {
  const draft = shallowRef<PublishDraft>(defaultDraft)

  const hasDraft = ref(false)

  // 保存草稿到缓存
  const saveDraft = () => {
    try {
      const content = draft.value.content.trim()
      const images = draft.value.images || []
      const location = draft.value.location || ''
      const visibility = draft.value.visibility || ''
      const remindFriends = draft.value.remindFriends || []

      const draftData = {
        content,
        images,
        location,
        visibility,
        remindFriends
      }

      console.log('准备保存草稿到本地:', draftData)
      
      // 同步保存到 localStorage
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
      
      // 验证保存是否成功
      const savedData = localStorage.getItem(DRAFT_KEY)
      if (!savedData) {
        console.error('保存失败：无法读取保存的数据')
        showToast('保存草稿失败')
        return false
      }

      // 验证保存的数据是否正确
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.content !== content || 
            parsedData.location !== location ||
            parsedData.visibility !== visibility ||
            JSON.stringify(parsedData.remindFriends) !== JSON.stringify(remindFriends) ||
            JSON.stringify(parsedData.images) !== JSON.stringify(images)) {
          console.error('保存的数据与原数据不一致')
          showToast('保存草稿失败')
          return false
        }
      } catch (e) {
        console.error('保存的数据格式错误:', e)
        showToast('保存草稿失败')
        return false
      }

      console.log('草稿保存成功')
      hasDraft.value = true
      showToast('已保存草稿')
      return true
    } catch (error) {
      console.error('保存草稿失败:', error)
      showToast('保存草稿失败')
      return false
    }
  }

  // 加载草稿
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      console.log('尝试加载草稿, 原始数据:', savedDraft)

      if (!savedDraft) {
        console.log('没有找到草稿数据')
        return false
      }

      const parsedDraft = JSON.parse(savedDraft)
      console.log('解析后的草稿数据:', parsedDraft)

      draft.value = {
        content: String(parsedDraft.content || ''),
        images: Array.isArray(parsedDraft.images) ? parsedDraft.images : [],
        location: String(parsedDraft.location || '选择位置'),
        visibility: String(parsedDraft.visibility || '公开'),
        remindFriends: Array.isArray(parsedDraft.remindFriends) ? parsedDraft.remindFriends : []
      }

      hasDraft.value = true
      console.log('草稿加载成功:', draft.value)
      return true
    } catch (error) {
      console.error('加载草稿失败:', error)
      showToast('加载草稿失败')
      return false
    }
  }

  // 清除草稿（仅在发布成功后调用）
  const clearDraft = () => {
    try {
      console.log('清除草稿')
      localStorage.removeItem(DRAFT_KEY)
      draft.value = { ...defaultDraft }
      hasDraft.value = false
      console.log('草稿已清除')
    } catch (error) {
      console.error('清除草稿失败:', error)
    }
  }

  // 检查发布条件
  const checkCanPublish = () => {
    if (!draft.value.content.trim()) {
      showToast('请输入内容')
      return false
    }
    return true
  }

  // 更新草稿内容（不保存到本地）
  const updateDraft = (newDraft: Partial<PublishDraft>) => {
    console.log('更新草稿内容:', newDraft)
    draft.value = {
      ...draft.value,
      ...newDraft,
      location: newDraft.location !== undefined ? newDraft.location : draft.value.location,
      visibility: newDraft.visibility !== undefined ? newDraft.visibility : draft.value.visibility,
      remindFriends: newDraft.remindFriends !== undefined ? newDraft.remindFriends : draft.value.remindFriends,
      images: newDraft.images !== undefined ? newDraft.images : draft.value.images
    }
    console.log('更新后的草稿:', draft.value)
  }

  // 处理退出
  const handleExit = async () => {
    try {
      const content = draft.value.content.trim()

      if (!content) {
        console.log('没有内容需要保存，直接返回')
        return true
      }

      console.log('显示保存对话框')
      const result = await new Promise((resolve) => {
        showDialog({
          title: '保存草稿',
          message: '是否保存当前内容？',
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          showCancelButton: true
        }).then((action) => {
          console.log('用户选择:', action)
          if (action === 'confirm') {
            console.log('用户选择保存，执行保存操作')
            const saveResult = saveDraft()
            console.log('保存结果:', saveResult)
            resolve(saveResult)
          } else {
            console.log('用户选择不保存，直接返回')
            resolve(true)
          }
        })
      })

      return result
    } catch (error) {
      console.error('处理退出失败:', error)
      return false
    }
  }

  // 组件挂载时自动加载草稿
  onMounted(() => {
    console.log('组件挂载，尝试加载草稿')
    if (loadDraft()) {
      showToast('已恢复未发布的内容')
    }
  })

  return {
    draft,
    hasDraft,
    updateDraft,
    saveDraft,
    loadDraft,
    clearDraft,
    checkCanPublish,
    handleExit
  }
}
