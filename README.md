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

## 文章阅读宽度

普通文章在桌面使用最高 840px 的正文宽度，右侧保留本页目录。规则集中在 `.vitepress/theme/doc-layout.css`，手机沿用默认主题布局。

大表格或可视化较多的文章，可以在 Markdown 顶部开启最高 1080px 的宽版；实际宽度随屏幕和侧栏可用空间缩小：

```yaml
---
pageClass: wide-doc
---
```

## 首页主视觉

首页沿用 VitePress 默认布局；右侧主视觉在 `.vitepress/theme/components/HomeUniverse.vue`，通过主题的 `home-hero-image` 插槽挂载。

角色和 C++、Python、Scratch 图标位于 `.vitepress/theme/assets/`，均为本项目绘制的透明 WebP。动效默认播放，支持离屏暂停及系统减少动态效果设置；首页课程模块目前仅展示分类，没有课程正文。


## 首页模块维护

在 `index.md` 顶部的 `features` 中添加课程卡片，沿用 VitePress 原生语法：

```yaml
  - title: 新课程名称
    details: 课程涵盖的内容
    # 有实际页面后再添加 link: /课程路径/
```

`icon` 为可选项。竞赛入口在同一文件的 `examGuides` 中维护：

```yaml
  - title: GESP 考级
    icon: levels  # 可选：levels / checklist / code / trophy
    details: 分级路线 · 知识清单 · 备考资料
    # 有实际页面后再添加 link: /gesp/
```

没有 `link` 时仅展示分类，不生成空链接。当前四张课程卡片在桌面两列、手机单列；竞赛指南作为独立模块，桌面四列、手机两列。
