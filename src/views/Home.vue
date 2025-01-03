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
            <div class="action-bar">
              <span @click="handleLike(moment)">
                点赞 {{ moment.likes?.length || 0 }}
              </span>
              <span style="margin-left: 10px" @click="toggleComments(moment.id)">
                评论 {{ moment.comments?.length || 0 }}
              </span>
              <span style="margin-left: 10px" @click="showShareSheet(moment)">分享</span>
            </div>
          </div>

          <!-- 评论区域 -->
          <transition name="slide-fade">
            <div v-if="isCommentsExpanded(moment.id)" class="comments-section">
              <div
                v-for="comment in sortedComments(moment.comments)"
                :key="comment.id"
                class="comment-thread"
              >
                <!-- 主评论 -->
                <div class="comment-main">
                  <van-image
                    round
                    width="32"
                    height="32"
                    :src="comment.user.avatar"
                    class="avatar"
                  />
                  <div class="comment-content">
                    <div class="comment-user">{{ comment.user.name }}</div>
                    <div class="comment-text">{{ comment.content }}</div>
                    <div class="comment-footer">
                      <span class="comment-time">{{ getTimeAgo(comment.timestamp) }}</span>
                      <span class="reply-btn" @click="handleCommentClick(moment, comment)">回复</span>
                    </div>
                  </div>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length" class="replies-section">
                  <div
                    v-for="reply in sortedReplies(comment.replies)"
                    :key="reply.id"
                    class="reply-item"
                  >
                    <div class="reply-main">
                      <van-image
                        round
                        width="24"
                        height="24"
                        :src="reply.user.avatar"
                        class="avatar"
                      />
                      <div class="reply-content">
                        <div class="reply-user">{{ reply.user.name }}</div>
                        <div class="reply-text">
                          <template v-if="reply.replyTo">
                            回复 <span class="reply-to">@{{ reply.replyTo.name }}</span>：
                          </template>
                          {{ reply.content }}
                        </div>
                        <div class="reply-footer">
                          <span class="reply-time">{{ getTimeAgo(reply.timestamp) }}</span>
                          <span class="reply-btn" @click="handleCommentClick(moment, comment)">回复</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
      round
      :style="{ padding: '16px' }"
    >
      <div class="comment-input-container">
        <van-field
          v-model="commentText"
          rows="3"
          autosize
          type="textarea"
          placeholder="说点什么..."
          ref="commentInputRef"
        />
        
        <div class="comment-toolbar">
          <div class="emoji-picker">
            <van-popover
              v-model:show="showEmojiPicker"
              placement="top"
              trigger="click"
            >
              <template #reference>
                <van-icon name="smile-o" size="24" />
              </template>
              
              <div class="emoji-container">
                <div class="emoji-categories">
                  <span
                    v-for="cat in categories"
                    :key="cat.id"
                    :class="{ active: currentCategory === cat.id }"
                    @click="setCategory(cat.id)"
                  >
                    {{ cat.name }}
                  </span>
                </div>
                <div class="emoji-list">
                  <span
                    v-for="emoji in getCurrentEmojis"
                    :key="emoji"
                    class="emoji-item"
                    @click="handleEmojiClick(emoji)"
                  >
                    {{ emoji }}
                  </span>
                </div>
              </div>
            </van-popover>
          </div>
          
          <van-button
            type="primary"
            size="small"
            @click="handleCommentSubmit"
          >
            发送
          </van-button>
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
const { getTimeAgo } = useTimeAgo()

// 表情相关
const showEmojiPicker = ref(false)
const { categories, currentCategory, getCurrentEmojis, setCategory, insertEmoji } = useEmoji()

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
  
  // 关闭表情选择器
  showEmojiPicker.value = false
}

// 评论相关
const expandedCommentIds = ref<number[]>([])
const showCommentInput = ref(false)
const commentText = ref('')
const commentInputRef = ref()
const currentMoment = ref<IMoment | null>(null)
const replyToComment = ref<IComment | null>(null)
const replyToUser = ref<IUser | null>(null)

const isCommentsExpanded = (momentId: number) => {
  return expandedCommentIds.value.includes(momentId)
}

const toggleComments = (momentId: number) => {
  const index = expandedCommentIds.value.indexOf(momentId)
  if (index === -1) {
    expandedCommentIds.value.push(momentId)
  } else {
    expandedCommentIds.value.splice(index, 1)
  }
}

// 打开评论输入框
const openCommentInput = (moment: IMoment, comment?: IComment) => {
  currentMoment.value = moment
  if (comment) {
    replyToComment.value = comment
    replyToUser.value = comment.user
  } else {
    replyToComment.value = null
    replyToUser.value = null
  }
  showCommentInput.value = true
  nextTick(() => {
    commentInputRef.value?.focus()
  })
}

// 处理评论提交
const handleCommentSubmit = async () => {
  if (!commentText.value.trim() || !currentMoment.value) return
  
  try {
    if (replyToComment.value) {
      // 回复评论
      await store.addComment(
        currentMoment.value.id,
        commentText.value,
        replyToComment.value
      )
    } else {
      // 发表新评论
      await store.addComment(
        currentMoment.value.id,
        commentText.value
      )
    }
    
    // 确保评论展开
    if (!isCommentsExpanded(currentMoment.value.id)) {
      expandedCommentIds.value.push(currentMoment.value.id)
    }
    
    // 重置状态
    commentText.value = ''
    showCommentInput.value = false
    currentMoment.value = null
    replyToComment.value = null
    replyToUser.value = null
    
  } catch (error) {
    console.error('Failed to submit comment:', error)
    showNotify('评论失败，请重试')
  }
}

const handleCommentClick = (moment: IMoment, comment?: IComment) => {
  // 确保评论展开
  if (!isCommentsExpanded(moment.id)) {
    expandedCommentIds.value.push(moment.id)
  }
  openCommentInput(moment, comment)
}

// 点赞相关
const handleLike = (moment: IMoment) => {
  store.toggleLike(moment.id)
}

// 评论排序方法
const sortedComments = (comments: IComment[]) => {
  return [...comments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const sortedReplies = (replies: IComment[]) => {
  return [...replies].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// 组件挂载时初始化数据
onMounted(() => {
  store.refreshMoments()
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

.action-bar {
  display: flex;
  color: #666;
  font-size: 14px;
}

.action-bar span {
  cursor: pointer;
}

.comments-section {
  margin-top: 10px;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 8px;
}

.comment-thread {
  margin-bottom: 16px;
}

.comment-main {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin: 4px 0;
}

.comment-content {
  margin-left: 8px;
  flex: 1;
}

.comment-user {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.comment-text {
  font-size: 14px;
  margin: 4px 0;
}

.comment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.comment-time {
  margin-right: 8px;
}

.reply-btn {
  color: #666;
  cursor: pointer;
}

.reply-btn:hover {
  color: #1989fa;
}

.replies-section {
  margin-left: 40px;
  margin-top: 4px;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin: 4px 0;
}

.reply-main {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin: 4px 0;
}

.reply-content {
  margin-left: 8px;
  flex: 1;
}

.reply-user {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.reply-text {
  font-size: 14px;
  margin: 4px 0;
}

.reply-to {
  color: #1989fa;
  font-weight: 500;
}

.reply-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.reply-time {
  margin-right: 8px;
}

.no-comments {
  text-align: center;
  color: #999;
  padding: 16px;
  cursor: pointer;
}

.comment-input-container {
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
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.emoji-container {
  width: 300px;
  padding: 8px;
}

.emoji-categories {
  display: flex;
  margin-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.emoji-categories span {
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.emoji-categories span.active {
  color: #1989fa;
  border-bottom: 2px solid #1989fa;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.emoji-item:hover {
  background-color: #f5f5f5;
}

.comment-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.emoji-picker {
  cursor: pointer;
}
</style>
