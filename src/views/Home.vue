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
              @click="navigateToUserProfile(moment)"
            />
            <div class="user-detail">
              <div class="username-wrapper">
                <span class="username" @click="navigateToUserProfile(moment)">{{ moment.username }}</span>
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
                点赞
                <van-icon name="like"  :color="moment.likes?.length?'red':''"/>
                {{ moment.likes?.length || 0 }}
              </span>
              <span style="margin-left: 10px" @click="toggleComments(moment.id)">
                评论 {{ moment.comments?.length || 0 }}
              </span>
              <span style="margin-left: 10px" @click="showShareSheet(moment)">分享</span>
              <span style="margin-left: 10px" @click="showLikesList(moment)">...</span>
            </div>
          </div>

          <!-- 评论区域 -->
          <transition name="slide-fade">
            <div v-if="isCommentsExpanded(moment.id)" class="comments-section">
              <template v-if="moment.comments.length === 0">
                <div class="no-comments">
                  <span class="no-comments-text">暂无评论</span>
                  <span class="comment-action" @click.stop="handleCommentClick(moment)">
                    <van-icon name="edit" />
                    发表评论
                  </span>
                </div>
              </template>
              <template v-else>
                <div v-for="comment in sortedComments(moment.comments)" :key="comment.id" class="comment-thread">
                  <!-- 主评论 -->
                  <div class="comment-main">
                    <van-image round width="32" height="32" :src="comment.user.avatar" class="avatar" />
                    <div class="comment-content">
                      <div class="comment-user">{{ comment.user.name }}</div>
                      <div class="comment-text">{{ comment.content }}</div>
                      <div class="comment-footer">
                        <span class="comment-time">{{ getTimeAgo(comment.timestamp) }}</span>
                        <span class="reply-btn reply-btn-main" @click.stop="handleCommentClick(moment, comment)">
                          <van-icon name="chat-o" />
                          回复
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 回复列表 -->
                  <div v-if="comment.replies?.length" class="replies-section">
                    <div v-for="reply in sortedReplies(comment.replies)" :key="reply.id" class="reply-item">
                      <van-image round width="24" height="24" :src="reply.user.avatar" class="avatar" />
                      <div class="reply-content">
                        <div class="reply-text">
                          <span class="reply-user">{{ reply.user.name }}</span>
                          <template v-if="reply.replyTo">
                            <span class="reply-to">回复 @{{ reply.replyTo.name }}：</span>
                          </template>
                          {{ reply.content }}
                        </div>
                        <div class="reply-footer">
                          <span class="reply-time">{{ getTimeAgo(reply.timestamp) }}</span>
                          <span class="reply-btn" @click.stop="handleCommentClick(moment, comment, reply)">
                            <van-icon name="chat-o" />
                            回复
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 评论输入框 -->
              <div v-if="showCommentInput && currentMoment?.id === moment.id" class="comment-input-section">
                <van-field
                  v-model="commentText"
                  rows="2"
                  autosize
                  type="textarea"
                  placeholder="说点什么..."
                  class="comment-input"
                >
                  <template #button>
                    <van-button size="small" type="primary" @click.stop="handleCommentSubmit">发送</van-button>
                  </template>
                </van-field>
              </div>
            </div>
          </transition>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 点赞列表弹窗 -->
    <van-popup
      v-model:show="showLikes"
      round
      position="bottom"
      :style="{ height: '40%' }"
    >
      <div class="likes-popup">
        <div class="likes-header">
          <span>点赞列表({{currentMoment?.likes?.length  ||0}})</span>
          <van-icon name="cross" @click="showLikes = false" />
        </div>
        <div class="likes-list">
          <template v-if="currentMoment?.likes?.length">
            <div v-for="userId in currentMoment.likes" :key="userId" class="like-item">
              <van-image
                round
                width="40"
                height="40"
                :src="getUserById(userId)?.avatar"
              />
              <span class="like-username">{{ getUserById(userId)?.name }}</span>
            </div>
          </template>
          <div v-else class="no-likes">
            暂无点赞
          </div>
        </div>
      </div>
    </van-popup>

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
import { useUserStore } from '../store/user'

const router = useRouter()
const store = useMomentsStore()
const userStore = useUserStore()
const { moments } = storeToRefs(store)

// 使用hooks
const { showShare, shareOptions, showShareSheet, onSelectSharePlatform } = useShare()
const { handleImagePreview } = useImagePreview()
const { loading, refreshing, finished, onLoad, onRefresh } = useLoadMore()
const { getTimeAgo } = useTimeAgo()
const commentInputRef=  ref<null>()
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
const currentMoment = ref<IMoment | null>(null)
const replyToComment = ref<IComment | null>(null)
const replyToUser = ref<{ id: number; name: string } | null>(null)

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

// 处理评论点击
const handleCommentClick = (moment: IMoment, comment: IComment, reply?: IComment) => {
  if (!moment) {
    console.error('Invalid moment:', moment)
    return
  }

  // 阻止事件冒泡
  event?.stopPropagation()

  // 如果是回复评论，确保评论区展开
  if (!isCommentsExpanded(moment.id)) {
    expandedCommentIds.value.push(moment.id)
  }
  
  // 打开评论输入框，设置回复信息
  currentMoment.value = moment
  commentText.value = ''
  
  // 如果是回复二级评论，也要指向原评论
  if (reply && reply.user) {
    replyToUser.value = { 
      id: reply.user.id,
      name: reply.user.name 
    }
    commentText.value = `回复@${reply.user.name}：`
  } else if (comment && comment.user) {
    replyToUser.value = { 
      id: comment.user.id,
      name: comment.user.name 
    }
    commentText.value = `回复@${comment.user.name}：`
  }
  
  // 记录父评论ID
  replyToComment.value = comment
  showCommentInput.value = true
}

// 处理评论提交
const handleCommentSubmit = async () => {
  if (!commentText.value.trim() || !currentMoment.value) {
    showToast('请输入评论内容')
    return
  }

  try {
    // 提取实际的评论内容（去掉"回复@xxx："的前缀）
    const content = commentText.value.replace(/^回复@.*：/, '').trim()
    if (!content) {
      showToast('请输入评论内容')
      return
    }
    
    // 添加评论
    await store.addComment(
      currentMoment.value.id,
      content,
      replyToUser.value,
      replyToComment.value?.id
    )

    // 清空输入框和状态
    commentText.value = ''
    showCommentInput.value = false
    replyToUser.value = null
    replyToComment.value = null
    showToast('评论成功')
  } catch (error) {
    console.error('评论失败:', error)
    showToast('评论失败')
  }
}

// 评论排序方法
const sortedComments = (comments: IComment[] = []) => {
  return [...comments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const sortedReplies = (replies: IComment[] = []) => {
  return [...replies].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// 点赞相关
const showLikes = ref(false)
const handleLike = (moment: IMoment) => {
  store.toggleLike(moment.id)
}

const getUserById = (userId: number) => {
  return userStore.users.find(user => user.id === userId)
}

const showLikesList = (moment: IMoment) => {
  currentMoment.value = moment
  showLikes.value = true
}
const handlePublish=()=>{
  router.push('/publish')
}

// 跳转到用户详情页
const navigateToUserProfile = (moment: IMoment) => {
  router.push(`/user/${moment.userId || 1}`)
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
  margin-top: 12px;
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.no-comments {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  color: #999;
  font-size: 14px;
  background-color: #fff;
  border-radius: 8px;
}

.comment-action {
  color: #1989fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-action:hover {
  opacity: 0.8;
}

.comment-thread {
  margin-bottom: 16px;
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
}

.comment-main {
  display: flex;
  align-items: flex-start;
}

.comment-content {
  flex: 1;
  margin-left: 8px;
}

.comment-user {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.comment-text {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.comment-footer {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.replies-section {
  margin-left: 40px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #fff;
  border-radius: 6px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-content {
  flex: 1;
  margin-left: 8px;
}

.reply-text {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.reply-user {
  font-weight: 500;
  color: #333;
}

.reply-to {
  color: #1989fa;
  margin: 0 4px;
}

.reply-footer {
  margin-top: 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.reply-time, .comment-time {
  margin-right: 12px;
}

.reply-btn {
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-btn:hover {
  color: #1989fa;
}

.comment-input-section {
  margin-top: 12px;
}

.comment-input {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
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

.likes-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.likes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  font-weight: 500;
}

.likes-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.like-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.like-item:last-child {
  border-bottom: none;
}

.like-username {
  margin-left: 12px;
  font-size: 14px;
  color: #333;
}

.no-likes {
  text-align: center;
  color: #999;
  padding: 32px 0;
}
</style>
