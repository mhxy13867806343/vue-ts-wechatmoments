# Vue TypeScript WeChat Moments

[中文文档](./README-zh.md)

一个使用 Vue 3 + TypeScript + Vite 实现的微信朋友圈项目。

## 功能特性

### Post Management
- Create and publish posts with text, images, and videos
- Quick publish with long-press
- Draft auto-save
- Multiple media upload support
- Share posts with friends

![Home Page](./screenshots/home.png)

### Interactions
- Like/Unlike posts
- View likes list
- Comment on posts
- Reply to comments
- Emoji picker support
- @mentions support

![Like Button](./screenshots/dianzan.png)
![Comments](./screenshots/pinglun.png)

### Media Handling
- Image preview with zoom
- Video playback
- Multiple image grid layout
- Image compression

![Image Grid 1](./screenshots/img_1.png)
![Image Grid 2](./screenshots/img_2.png)
![Image Grid 3](./screenshots/img_3.png)

### User Experience
- Pull to refresh
- Infinite scroll
- Smooth animations
- Responsive design
- Time formatting (e.g., "2 hours ago")
- Loading skeletons

![Image Grid 4](./screenshots/img_4.png)
![Image Grid 5](./screenshots/img_5.png)

## 技术栈

- Vue 3.2
- TypeScript
- Vite
- Vant UI
- Pinia

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
  ├── components/     # 组件
  ├── hooks/         # 自定义 hooks
  ├── store/         # Pinia store
  ├── types/         # TypeScript 类型定义
  ├── utils/         # 工具函数
  └── views/         # 页面组件
```

## License

MIT

---

<h1 id="chinese-version">Vue TypeScript 微信朋友圈</h1>

使用 Vue 3、TypeScript 和 Vite 构建的微信朋友圈克隆项目。

## 功能特性

### 动态管理
- 发布文字、图片、视频动态
- 长按快速发布
- 草稿自动保存
- 多媒体上传支持
- 分享动态给好友

![首页](./screenshots/home.png)

### 互动功能
- 点赞/取消点赞
- 查看点赞列表
- 评论动态
- 回复评论
- 表情选择器
- @好友功能

![点赞按钮](./screenshots/dianzan.png)
![评论区](./screenshots/pinglun.png)
![分享](./screenshots/fenxiang.png)

### 媒体处理
- 图片预览与缩放
- 视频播放
- 多图网格布局
- 图片压缩

![图片网格1](./screenshots/img_1.png)
![图片网格2](./screenshots/img_2.png)
![图片网格3](./screenshots/img_3.png)

### 用户体验
- 下拉刷新
- 无限滚动
- 流畅动画
- 响应式设计
- 时间格式化（如"2小时前"）
- 加载骨架屏

![图片网格4](./screenshots/img_4.png)
![图片网格5](./screenshots/img_5.png)

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vant UI
- Pinia

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
  ├── components/     # 组件
  ├── hooks/         # 自定义 hooks
  ├── store/         # Pinia store
  ├── types/         # TypeScript 类型定义
  ├── utils/         # 工具函数
  └── views/         # 页面组件
```

## License

MIT
