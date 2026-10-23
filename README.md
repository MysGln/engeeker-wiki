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

## 数学公式

公式使用独立的标准数学字形，不继承正文手写字体。行内公式写 `$x^2$`、`$a_i$`；独立公式使用单独成行的 `$$` 包裹：

```latex
$$
\sum_{i=1}^{n} a_i
$$
```

公式在构建时生成 SVG，发布后不需要外部公式脚本或字体服务。数学表达式请使用公式语法，普通 HTML `<sup>`、`<sub>` 仍用于文本上下标。

## 文章阅读宽度

文章页右上角的「阅读设置」提供标准（688px）与较宽（840px）两档正文宽度，章节导航和本页目录可以独立收起。默认较宽、两侧目录开启，选择仅保存在当前浏览器；首页不显示阅读设置。

目录收起后释放占位，正文在剩余区域居中；两侧都收起时整页居中。小于 1440px 时，本页目录使用顶部下拉入口；手机的章节导航沿用 VitePress 抽屉。规则集中在 `.vitepress/theme/doc-layout.css`，手机正文保留原有字号与内边距。

`demo.md` 配有一组真实页面导航供验收布局，目前没有创建课程正文，也未接入课程目录自动生成。

大表格或可视化较多的文章，可以在 Markdown 顶部开启最高 1080px 的宽版；「较宽」模式下实际宽度随屏幕和侧栏可用空间缩小；选择「标准」后统一使用 688px 上限：

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
