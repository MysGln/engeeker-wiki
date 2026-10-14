import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import OutlineProgress from './components/OutlineProgress.vue'
import './style.css'
import './typography.css'

export default {
  ...DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'aside-outline-before': () => h(OutlineProgress)
  })
}
