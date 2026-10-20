import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import OutlineProgress from './components/OutlineProgress.vue'
import HomeUniverse from './components/HomeUniverse.vue'
import BrandTitle from './components/BrandTitle.vue'
import './style.css'
import './typography.css'

export default {
  ...DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'aside-outline-before': () => h(OutlineProgress),
    'home-hero-image': () => h(HomeUniverse),
    'home-hero-info': () => h(BrandTitle)
  })
}
