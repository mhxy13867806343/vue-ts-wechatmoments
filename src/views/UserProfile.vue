<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <!-- 用户基本信息 -->
    <div class="user-header">
      <van-image
        round
        width="80"
        height="80"
        :src="currentUser?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
        class="avatar"
      />
      <div class="user-info">
        <h2 class="username">{{ currentUser?.name || '用户名' }}</h2>
        <p class="bio">这是一个简短的个人介绍，描述自己的兴趣爱好。</p>
      </div>
    </div>

    <!-- 用户统计信息 -->
    <div class="user-stats">
      <div class="stat-item">
        <span class="stat-number">42</span>
        <span class="stat-label">动态</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">128</span>
        <span class="stat-label">关注</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">256</span>
        <span class="stat-label">粉丝</span>
      </div>
    </div>

    <!-- 用户动态列表 -->
    <div class="user-moments">
      <h3 class="section-title">Ta的动态</h3>
      <div class="moment-list">
        <div v-for="moment in userMoments" :key="moment.id" class="moment-item">
          <div class="moment-header">
            <van-image
              round
              width="40"
              height="40"
              :src="moment.avatar"
            />
            <div class="moment-info">
              <span class="moment-username">{{ moment.username }}</span>
              <span class="moment-time">{{ moment.timestamp }}</span>
            </div>
          </div>
          <p class="moment-content">{{ moment.content }}</p>
          <div class="moment-images" v-if="moment.images && moment.images.length">
            <van-image
              v-for="(img, index) in moment.images.slice(0, 9)"
              :key="index"
              width="100"
              height="100"
              :src="img"
              fit="cover"
            />
          </div>
          <div class="moment-footer">
            <span class="action">
              <van-icon name="like" />
              {{ moment.likes?.length || 0 }}
            </span>
            <span class="action">
              <van-icon name="comment" />
              {{ moment.comments?.length || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { useMomentsStore } from '../store/moments'
import type { IMoment } from '../types'

const userStore = useUserStore()
const momentsStore = useMomentsStore()

const currentUser = ref(userStore.currentUser)
const userMoments = ref<IMoment[]>([
  {
    id: 1,
    username: currentUser.value?.name || '用户名',
    avatar: currentUser.value?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    content: '今天天气真好，出去玩了一天！',
    images: [
      'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg'
    ],
    timestamp: '2025-01-04 12:00',
    likes: [1, 2, 3],
    comments: [
      {
        id: 1,
        content: '真不错啊！',
        user: { id: 2, name: '张三', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' },
        timestamp: '2025-01-04 12:30'
      }
    ],
    isCurrentUser: true
  },
  {
    id: 2,
    username: currentUser.value?.name || '用户名',
    avatar: currentUser.value?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    content: '分享一个有趣的TypeScript小技巧！',
    images: [],
    timestamp: '2025-01-03 15:30',
    likes: [1, 4],
    comments: [],
    isCurrentUser: true
  }
])

onMounted(() => {
  // 这里可以加载用户的真实数据
  // momentsStore.getUserMoments(currentUser.value?.id)
})
</script>

<style scoped>
.user-profile {
  padding: 16px;
  background: #fff;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  margin-right: 16px;
}

.user-info {
  flex: 1;
}

.username {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.bio {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.moment-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.moment-info {
  margin-left: 12px;
}

.moment-username {
  display: block;
  font-weight: 500;
}

.moment-time {
  font-size: 12px;
  color: #999;
}

.moment-content {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.5;
}

.moment-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 12px;
}

.moment-footer {
  display: flex;
  gap: 16px;
}

.action {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.van-icon {
  font-size: 16px;
}
</style>
