# 硬壳编程 Wiki

[网站](https://mysgln.github.io/engeeker-wiki/)

## 本地预览

```sh
wiki-start  # 启动
wiki-stop   # 停止
```

访问 http://127.0.0.1:4173/。新环境在项目目录执行 `npm ci`、`npm run dev`。

## 更新内容

编辑 Markdown 页面，导航配置在 `.vitepress/config.mts`。

提交并推送到 `main`，GitHub Pages 自动更新。

## 首页主视觉

首页沿用 VitePress 默认布局；右侧主视觉在 `.vitepress/theme/components/HomeUniverse.vue`，通过主题的 `home-hero-image` 插槽挂载。

角色和 C++、Python、Scratch 图标位于 `.vitepress/theme/assets/`，均为本项目绘制的透明 WebP。动效默认播放，支持离屏暂停及系统减少动态效果设置；没有新增课程正文或模块。
