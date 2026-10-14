# 硬壳编程 Wiki

使用 VitePress 1.6.4 默认主题。当前保留基础首页、绿色主题、目录进度线和参考 JYY Wiki 的字体；学习模块按后续规划逐步补充。

- [网站](https://mysgln.github.io/engeeker-wiki/)
- [源码仓库](https://github.com/MysGln/engeeker-wiki)
- [自动发布记录](https://github.com/MysGln/engeeker-wiki/actions)

## 本地服务

`~/.zshrc` 已配置快捷命令，在任意目录使用：

```sh
wiki-start  # 后台启动
wiki-stop   # 停止服务
```

已打开的终端先运行一次 `source ~/.zshrc`。访问 http://127.0.0.1:4173/ 。重复启动不会多开；关闭终端或网页不会停止后台服务。修改 Markdown 后会自动刷新。

脚本为 `scripts/wiki-service.zsh`，使用本机 Homebrew Node.js；日志在 `.vitepress/wiki-dev.log`，不进入 Git。

前台运行或构建：

```sh
cd "/Users/guyu/教育培训/管理工作/C++课程课件/WIKI"
npm run dev      # Ctrl+C 停止
npm run build
npm run preview  # 预览构建产物，Ctrl+C 停止
```

新电脑首次运行或重新安装依赖时执行 `npm ci`。构建产物在 `.vitepress/dist/`；缓存与构建产物可以重新生成。

## 更新与自动发布

修改文件后在 WIKI 目录提交并推送：

```sh
git status
git add index.md .vitepress/config.mts
git commit -m "更新首页"
git push
```

上面的 `git add` 文件名根据本次修改调整。推送到 `main` 后，GitHub Actions 自动构建发布，完成状态见仓库 Actions。

工作流为 `.github/workflows/deploy-pages.yml`，使用 Node.js 22、`npm ci`、`npm run build` 和 `.vitepress/dist`。部署路径通过 `VITEPRESS_BASE` 自动适配 GitHub Pages 的仓库路径。

后续迁移 Vercel 时，导入同一仓库并使用已保留的 `vercel.json`，保持 `VITEPRESS_BASE` 未设置。只使用 Vercel 后关闭 Pages 工作流；自定义域名再调整 DNS。Vercel Hobby 限个人非商业用途，机构用途需核对套餐条件。

## 维护文件

| 文件 | 用途 |
| --- | --- |
| `index.md` | 首页 |
| `.vitepress/config.mts` | 标题、导航、侧栏与部署路径 |
| `.vitepress/theme/style.css` | 绿色主题与目录进度线样式 |
| `.vitepress/theme/components/OutlineProgress.vue` | 目录定位与进度线逻辑 |
| `.vitepress/theme/typography.css` | 正文、标题和代码字体与字号 |
| `public/fonts/` | 本地字体、来源与许可证 |

字体参考 [JYY Wiki](https://jyywiki.cn/GSE/2026/lab1.md)：正文 Kalam、标题及导航 Merienda One、代码 Fira Mono；中文使用参考页面的系统/浏览器回退。字体随站点本地加载。

Git 保留完整修改历史，`node_modules`、缓存、日志和构建产物不进入版本库。
