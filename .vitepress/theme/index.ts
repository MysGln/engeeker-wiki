import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import OutlineProgress from './components/OutlineProgress.vue'
import HomeUniverse from './components/HomeUniverse.vue'
import BrandTitle from './components/BrandTitle.vue'
import ExamGuides from './components/ExamGuides.vue'
import ReadingControls from './components/ReadingControls.vue'
import './style.css'
import './home-features.css'
import './typography.css'
import './doc-layout.css'

export default {
  ...DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => h(ReadingControls),
    'sidebar-nav-before': () => h(ReadingControls, { placement: 'sidebar' }),
    'aside-outline-before': () => [h(ReadingControls, { placement: 'outline' }), h(OutlineProgress)],
    'home-hero-image': () => h(HomeUniverse),
    'home-hero-info': () => h(BrandTitle),
    'home-features-before': () => h('div', { class: 'wk-course-heading' }, [h('h2', '学习课程')]),
    'home-features-after': () => h(ExamGuides)
  })
}
