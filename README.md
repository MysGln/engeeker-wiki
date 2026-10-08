# 硬壳编程 Wiki

使用 VitePress 1.6.4 默认主题。当前仅保留初始首页、Markdown 示例和 API 示例，按小步逐项完善。

## 本地运行

```sh
npm ci
npm run dev
```

浏览器打开 http://127.0.0.1:4173/ 。

## 构建

```sh
npm run build
npm run preview
```

静态产物位于 `.vitepress/dist/`。

## 文件

- `index.md`：默认首页。
- `markdown-examples.md`：Markdown 文档示例。
- `api-examples.md`：VitePress API 示例。
- `.vitepress/config.mts`：标题、导航、侧边栏。
- `.vitepress/theme/style.css`：品牌颜色，保留默认布局。

## Git 维护

此目录是独立 Git 仓库。先进入 WIKI 再操作 Git：

```sh
git status
git add index.md .vitepress/config.mts
git commit -m "更新首页"
git log --oneline
```

`node_modules`、构建产物与缓存不会进入版本库。初始版本已建立本地提交，尚未绑定远程仓库。

此前自定义原型保存在 `.backups/engeeker-wiki-custom-backup-20261008.tar.gz`，不参与站点构建和 Git 提交。
