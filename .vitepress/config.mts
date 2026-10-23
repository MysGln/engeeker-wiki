import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: process.env.VITEPRESS_BASE || '/',
  srcExclude: ['README.md'],
  title: "硬壳编程 Wiki",
  description: "核心知识库",
  markdown: {
    math: true
  },
  transformHead({ pageData }) {
    if (pageData.isNotFound || (pageData.frontmatter.layout && pageData.frontmatter.layout !== 'doc')) return []
    // Apply stored layout before first paint; the controls hydrate the same preferences.
    return [['script', {}, `(function(){
      var d=document.documentElement.dataset,p={};
      try{p=JSON.parse(localStorage.getItem('engeeker-wiki-reading-v1')||'null')||{}}catch(e){}
      d.wikiReading='';
      d.wikiWidth=p.width==='standard'?'standard':'wide';
      d.wikiSidebar=p.sidebar===false?'hide':'show';
      d.wikiOutline=p.outline===false?'hide':'show';
    })()`]]
  },
  themeConfig: {
    outlineTitle: '本页目录',
    sidebarMenuLabel: '章节',
    returnToTopLabel: '返回顶部',
    sidebar: {
      '/demo': [{ text: '样式预览', items: [{ text: '样式演示', link: '/demo' }] }]
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: '首页', link: '/' }],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/MysGln/engeeker-wiki' }
    ]
  }
})
