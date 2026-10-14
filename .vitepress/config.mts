import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: process.env.VITEPRESS_BASE || '/',
  srcExclude: ['README.md'],
  title: "硬壳编程 Wiki",
  description: "核心知识库",
  themeConfig: {
    outlineTitle: '本页目录',
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: '首页', link: '/' }],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/MysGln/engeeker-wiki' }
    ]
  }
})
