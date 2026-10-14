# 硬壳编程 Wiki

使用 VitePress 1.6.4 默认主题。当前仅保留初始首页、Markdown 示例和 API 示例，按小步逐项完善。

## 启动、停止与重启

`~/.zshrc` 已配置两个快捷命令，在任意目录都可以使用：

```sh
wiki-start  # 后台启动；已运行时不会重复启动
wiki-stop   # 停止本 WIKI 服务
```

新开的终端会自动加载。当前已打开的终端先运行一次 `source ~/.zshrc`。

浏览器打开 http://127.0.0.1:4173/ 。关闭终端或网页不会停止后台服务；修改 Markdown 后页面会自动更新。重启时先运行 `wiki-stop`，再运行 `wiki-start`。

服务脚本保存在 `scripts/wiki-service.zsh`，使用本机 Homebrew Node.js。日志位于 `.vitepress/wiki-dev.log`（不进入 Git）。命令会验证端口 4173 的进程是否属于本项目，避免停止其他服务。

需要在前台观察日志，也可以进入项目目录执行：

```sh
cd "/Users/guyu/教育培训/管理工作/C++课程课件/WIKI"
npm run dev
```

前台运行时按 `Ctrl+C` 停止。新电脑首次运行、或重新安装依赖时，先执行 `npm ci`。

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

## 字体与文档排版

字体参考 https://jyywiki.cn/GSE/2026/lab1.md （2026-10-15 核对）：正文 Kalam、标题及导航 Merienda One、代码 Fira Mono。文档正文 16px，一级/二级/三级标题分别为 24/20/18px，正文段落行距 1.625，代码行距 1.5。

设置集中在 `.vitepress/theme/typography.css`。字体文件随站点保存在 `public/fonts/`，不依赖外部字体请求；来源与许可证在同目录。中文沿用参考页面的系统/浏览器回退，跨操作系统的字形可能不同。当前只同步字体和排版参数，保持原有页面结构、配色及目录进度线。

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
