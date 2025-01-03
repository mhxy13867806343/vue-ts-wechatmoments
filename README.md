# Vue TypeScript WeChat Moments

一个使用 Vue 3 + TypeScript + Vite 实现的微信朋友圈项目。

## 功能特性

- 发布动态（支持文字、图片、视频）
- 点赞功能
- 评论功能（支持回复）
- 表情选择
- 草稿保存
- 图片预览
- 时间显示优化

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
