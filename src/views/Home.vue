<template>
  <div class="moments">
    <van-nav-bar
      title="朋友圈"
      fixed
      placeholder
      :border="false"
      :safe-area-inset-top="true"
    >
      <template #right>
        <van-button
          type="primary"
          size="small"
          @click="handlePublish"
        >发布</van-button>
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="moment in moments" :key="moment.id" class="moment-item">
          <div class="user-info">
            <van-image
              round
              width="40"
              height="40"
              :src="moment.avatar"
            />
            <div class="user-detail">
              <div class="username-wrapper">
                <span class="username">{{ moment.username }}</span>
                <!-- 当前用户的动态显示删除按钮 -->
                <van-icon 
                  v-if="moment.isCurrentUser" 
                  name="delete" 
                  class="delete-icon"
                  @click="handleDelete(moment.id)"
                />
              </div>
              <span class="timestamp">{{ getTimeAgo(moment.timestamp) }}</span>
            </div>
          </div>

          <div class="moment-content" @click="handleCommentClick(moment)">
            <p>{{ moment.content }}</p>
            
            <div class="media-content" v-if="moment.images && moment.images.length">
              <div class="image-grid" :class="{ 'more-than-nine': moment.images.length > 9 }">
                <div 
                  v-for="(img, index) in moment.images.slice(0, 9)"
                  :key="index"
                  class="image-item"
                  @click.stop="handleImagePreview(moment.images, index)"
                >
                  <van-image
                    :src="img"
                    fit="cover"
                  />
                  <div v-if="index === 8 && moment.images.length > 9" class="more-images">
                    <span>{{ '+' + (moment.images.length - 9) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <video
              v-if="moment.video"
              :src="moment.video"
              controls
              style="width: 100%; max-height: 400px"
            ></video>
          </div>

          <div class="moment-footer">
            <div class="actions">
              <span @click="handleLikesClick(moment.id)">
                点赞 {{ moment.likes }}
              </span>
              <span style="margin-left: 10px" @click="toggleComments(moment.id)">
                评论 {{ moment.comments }}
              </span>
              <span style="margin-left: 10px" @click="showShareSheet(moment)">分享</span>
            </div>
          </div>

          <!-- 评论区域 -->
          <transition name="slide">
            <div v-if="isCommentsExpanded(moment.id)" class="comments-section">
              <div v-if="moment.commentsList && moment.commentsList.length">
                <div
                  v-for="comment in moment.commentsList"
                  :key="comment.id"
                  class="comment-thread"
                  @click="handleCommentClick(moment, comment)"
                >
                  <!-- 主评论 -->
                  <div class="comment-item">
                    <img :src="comment.user.avatar" class="comment-avatar" />
                    <div class="comment-content">
                      <div class="comment-info">
                        <span class="comment-username">{{ comment.user.name }}</span>
                        <span class="comment-text">{{ comment.content }}</span>
                      </div>
                      <span class="comment-time">{{ getTimeAgo(comment.timestamp) }}</span>
                    </div>
                  </div>

                  <!-- 回复列表 -->
                  <div v-if="comment.replies && comment.replies.length" class="replies-list">
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="reply-item"
                      @click.stop="handleCommentClick(moment, reply)"
                    >
                      <img :src="reply.user.avatar" class="reply-avatar" />
                      <div class="reply-content">
                        <div class="reply-info">
                          <span class="reply-username">{{ reply.user.name }}</span>
                          <span class="reply-text">{{ reply.content }}</span>
                        </div>
                        <span class="reply-time">{{ getTimeAgo(reply.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 没有评论时显示提示 -->
              <div v-else class="no-comments" @click="handleCommentClick(moment)">
                暂无评论，快来抢沙发吧~
              </div>
            </div>
          </transition>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 点赞列表弹窗 -->
    <van-action-sheet
      v-model:show="showLikesList"
      title="点赞列表"
      @close="closeLikesList"
    >
      <div class="likes-list">
        <div v-if="currentLikes && currentLikes.length > 0">
          <div
            v-for="like in currentLikes"
            :key="like.id"
            class="like-item"
          >
            <van-image
              round
              width="40"
              height="40"
              :src="like.user.avatar"
            />
            <span class="like-username">{{ like.user.name }}</span>
          </div>
        </div>
        <div v-else class="no-likes">
          还没有人点赞
        </div>
      </div>
    </van-action-sheet>

    <!-- 分享面板 -->
    <van-share-sheet
      v-model:show="showShare"
      title="分享到"
      :options="shareOptions"
      @select="onSelectSharePlatform"
    />

    <!-- 删除确认弹窗 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="删除动态"
      message="确定要删除这条动态吗？"
      show-cancel-button
      @confirm="confirmDelete"
    />

    <!-- 快速发布弹窗 -->
    <van-popup
      v-model:show="showQuickPublish"
      position="bottom"
      :style="{ padding: '10px' }"
    >
      <van-field
        v-model="quickPublishContent"
        placeholder="说点什么..."
        type="textarea"
        rows="3"
        autosize
      />
      <div style="text-align: right; margin-top: 10px">
        <van-button size="small" type="primary" @click="handleQuickPublish">发布</van-button>
      </div>
    </van-popup>

    <!-- 评论输入框 -->
    <van-popup
      v-model:show="showCommentInput"
      position="bottom"
      :style="{ padding: '10px' }"
    >
      <div class="comment-input-wrapper">
        <van-field
          v-model="commentText"
          :placeholder="replyToUser ? `回复 @${replyToUser.name}` : '说点什么...'"
          type="textarea"
          rows="3"
          autosize
          ref="commentInputRef"
        >
          <template #button>
            <van-button size="small" type="primary" @click="submitComment">发送</van-button>
          </template>
        </van-field>
        <div class="emoji-panel">
          <div class="emoji-tabs">
            <div
              v-for="category in emojiList"
              :key="category.category"
              class="emoji-tab"
              :class="{ active: currentCategory === category.category }"
              @click="setCategory(category.category)"
            >
              {{ category.category }}
            </div>
          </div>
          <div class="emoji-content">
            <span
              v-for="emoji in getCurrentEmojis()"
              :key="emoji"
              class="emoji-item"
              @click="handleEmojiClick(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMomentsStore } from '../store/moments'
import { storeToRefs } from 'pinia'
import { useShare } from '../hooks/useShare'
import { useImagePreview } from '../hooks/useImagePreview'
import { useTimeAgo } from '../hooks/useTimeAgo'
import { useLoadMore } from '../hooks/useLoadMore'
import { useInteractions } from '../hooks/useInteractions'
import { useCommentInput } from '../hooks/useCommentInput'
import { useEmoji } from '../hooks/useEmoji'
import type { IMoment, IComment } from '../types/moment'
import { showNotify, showToast } from 'vant'
import { useRouter } from 'vue-router'
import '../styles/home.css'

const router = useRouter()
const store = useMomentsStore()
const { moments } = storeToRefs(store)

// 使用hooks
const { showShare, shareOptions, showShareSheet, onSelectSharePlatform } = useShare()
const { handleImagePreview } = useImagePreview()
const { loading, refreshing, finished, onLoad, onRefresh } = useLoadMore()
const {
  showLikesList,
  expandedCommentIds,
  currentMomentId,
  handleLikesClick,
  toggleComments,
  isCommentsExpanded,
  closeLikesList,
  generateMockLikes,
  generateMockComments
} = useInteractions()

const {
  showCommentInput,
  commentText,
  replyToUser,
  openCommentInput,
  closeCommentInput,
  submitComment
} = useCommentInput()

const {
  emojiList,
  currentCategory,
  setCategory,
  getCurrentEmojis,
  insertEmoji
} = useEmoji()

// 获取当前动态的点赞列表
const currentLikes = computed(() => {
  if (!currentMomentId.value) return []
  return moments.value.find(m => m.id === currentMomentId.value)?.likesList || []
})

// 处理时间显示
const getTimeAgo = (timestamp: string) => {
  const { timeAgo } = useTimeAgo(timestamp)
  return timeAgo.value
}

const commentInputRef = ref<HTMLTextAreaElement>()

// 长按发布相关
const longPressTimer = ref<number | null>(null)
const showQuickPublish = ref(false)
const quickPublishContent = ref('')

// 开始计时
const startTimer = (e: TouchEvent | MouseEvent) => {
  if (e.type === 'touchstart' && !(e as TouchEvent).cancelable) {
    return // 如果是不可取消的触摸事件（如滚动中），则直接返回
  }
  e.preventDefault() // 防止长按选中文字
  longPressTimer.value = window.setTimeout(() => {
    showQuickPublish.value = true
  }, 3000) // 3秒长按
}

// 结束计时
const endTimer = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 快速发布
const handleQuickPublish = async () => {
  if (!quickPublishContent.value.trim()) {
    showToast('请输入内容')
    return false // 阻止弹窗关闭
  }

  try {
    await store.publishMoment({
      content: quickPublishContent.value,
      images: [],
      video: null
    })
    showToast('发布成功')
    quickPublishContent.value = ''
    showQuickPublish.value = false
    onRefresh() // 刷新列表
    return true // 允许弹窗关闭
  } catch (error) {
    showToast('发布失败，请重试')
    return false // 阻止弹窗关闭
  }
}

// 普通点击发布
const handlePublish = () => {
  router.push('/publish')
}

// 删除相关
const showDeleteConfirm = ref(false)
const momentToDelete = ref<number | null>(null)

// 处理删除点击
const handleDelete = (momentId: number) => {
  momentToDelete.value = momentId
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = () => {
  if (momentToDelete.value) {
    store.deleteMoment(momentToDelete.value)
    showNotify({ type: 'success', message: '删除成功' })
    momentToDelete.value = null
  }
}

// 处理评论点击
const handleCommentClick = (moment: IMoment, comment?: IComment) => {
  // 如果点击的是其他动态的评论，先关闭当前展开的评论
  if (currentMomentId.value && currentMomentId.value !== moment.id) {
    expandedCommentIds.value = expandedCommentIds.value.filter(id => id !== currentMomentId.value)
  }
  
  // 打开评论输入框
  if (comment) {
    openCommentInput(moment, { id: comment.user.id, name: comment.user.name })
  } else {
    openCommentInput(moment)
  }
}

// 处理表情点击
const handleEmojiClick = (emoji: string) => {
  if (!commentInputRef.value) return
  
  const textarea = commentInputRef.value.$el.querySelector('textarea')
  if (!textarea) return
  
  const cursorPosition = textarea.selectionStart || 0
  commentText.value = insertEmoji(emoji, commentText.value, cursorPosition)
  
  nextTick(() => {
    const newPosition = cursorPosition + emoji.length
    textarea.setSelectionRange(newPosition, newPosition)
    textarea.focus()
  })
}

// 组件挂载时初始化数据
onMounted(() => {
  store.refreshData()
  // 为每个动态添加点赞和评论数据
  const updatedMoments = moments.value.map(moment => ({
    ...moment,
    likesList: generateMockLikes(moment.likes),
    commentsList: generateMockComments(moment.comments)
  }))
  store.setMoments(updatedMoments)
})
</script>

<style scoped>
.moment-item {
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
  background: white;
}

.user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.user-detail {
  margin-left: 10px;
  flex: 1;
}

.username-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.username {
  font-weight: bold;
  color: #333;
}

.timestamp {
  font-size: 12px;
  color: #999;
}

.moment-content {
  margin: 10px 0;
}

.media-content {
  margin-top: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
}

.image-item :deep(.van-image) {
  width: 100%;
  height: 100%;
}

.more-images {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.moment-footer {
  margin-top: 10px;
  justify-content: flex-end;
}

.actions {
  display: flex;
  color: #666;
  font-size: 14px;
}

.actions span {
  cursor: pointer;
}

.comments-section {
  margin-top: 10px;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 8px;
}

.comment-thread {
  margin-bottom: 8px;
}

.comment-item, .reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 4px;
}

.comment-avatar, .reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.comment-content, .reply-content {
  flex: 1;
}

.comment-username, .reply-username {
  color: #576b95;
  font-weight: 500;
  margin-right: 5px;
}

.comment-text, .reply-text {
  color: #333;
}

.comment-time, .reply-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.replies-list {
  margin-left: 32px;
  margin-top: 4px;
}

.no-comments {
  color: #999;
  text-align: center;
  padding: 10px;
  cursor: pointer;
}

.comment-input-wrapper {
  padding: 10px;
}

.emoji-panel {
  padding: 10px 0;
  border-top: 1px solid #eee;
}

.emoji-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.emoji-tab {
  padding: 8px 12px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
}

.emoji-tab.active {
  color: #1989fa;
  border-bottom: 2px solid #1989fa;
}

.emoji-content {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 0 10px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 24px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s;
}

.emoji-item:hover {
  transform: scale(1.2);
}

.delete-icon {
  color: #999;
  font-size: 16px;
  padding: 4px;
}

.likes-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.like-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  justify-content: center;
}

.like-username {
  margin-left: 12px;
  font-size: 16px;
  color: #333;
}

.no-likes {
  text-align: center;
  color: #999;
  padding: 32px 0;
  font-size: 14px;
}

/* 评论展开/收起动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
