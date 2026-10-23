<script setup lang="ts">
import { useData, useRoute, onContentUpdated, withBase } from 'vitepress'
import { useSidebar } from 'vitepress/theme'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { applyReadingLayout, changeReadingLayout, loadReadingLayout, readingLayout, resetReadingLayout } from '../composables/useReadingLayout'

const props = withDefaults(defineProps<{ placement?: 'toolbar' | 'sidebar' | 'outline' }>(), { placement: 'toolbar' })
const { frontmatter, page } = useData()
const route = useRoute()
const { hasSidebar } = useSidebar()
const isDoc = computed(() => !page.value.isNotFound && (!frontmatter.value.layout || frontmatter.value.layout === 'doc'))
const hasOutline = ref(false)
const expanded = ref(false)
const trigger = ref<HTMLButtonElement>()
const popover = ref<HTMLDivElement>()
const popoverPosition = ref({ left: '16px', top: '72px' })
let mounted = false

function measureAvailability() {
  // Follow the native rendered outline, including per-page level overrides.
  hasOutline.value = isDoc.value && !!document.querySelector(
    '.VPDocAsideOutline.has-outline, .VPLocalNavOutlineDropdown > button .menu-text'
  )
}

function positionPopover() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const width = Math.min(280, window.innerWidth - 32)
  popoverPosition.value = {
    left: `${Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16))}px`,
    top: `${rect.bottom + 10}px`
  }
}

async function togglePopover() {
  expanded.value = !expanded.value
  if (!expanded.value) return
  positionPopover()
  await nextTick()
  popover.value?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
}

function closePopover(restoreFocus = false) {
  expanded.value = false
  if (restoreFocus) trigger.value?.focus()
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (expanded.value && !popover.value?.contains(target) && !trigger.value?.contains(target)) closePopover()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && expanded.value) {
    event.preventDefault()
    event.stopPropagation()
    closePopover(true)
  }
}

async function restoreSidebar() {
  await changeReadingLayout({ sidebar: true })
  if (window.innerWidth < 960) {
    // Reuse VitePress's drawer, backdrop, focus return and Escape handling.
    const menu = document.querySelector<HTMLButtonElement>('.VPLocalNav .menu')
    menu?.focus()
    menu?.click()
    await nextTick()
    document.getElementById('VPSidebarNav')?.focus()
  } else document.querySelector<HTMLButtonElement>('[aria-label="收起章节导航"]')?.focus()
}

async function hideSidebar() {
  if (window.innerWidth < 960) {
    document.querySelector<HTMLElement>('.VPBackdrop')?.click()
    await nextTick()
    document.querySelector<HTMLButtonElement>('.VPLocalNav .menu')?.focus()
  } else {
    await changeReadingLayout({ sidebar: false })
    document.querySelector<HTMLButtonElement>('[aria-label="展开章节导航"]')?.focus()
  }
}

async function restoreOutline() {
  await changeReadingLayout({ outline: true })
  if (window.innerWidth < 1440) {
    const menu = document.querySelector<HTMLButtonElement>('.VPLocalNavOutlineDropdown > button')
    menu?.focus()
    menu?.click()
  } else document.querySelector<HTMLButtonElement>('[aria-label="收起本页目录"]')?.focus()
}

async function hideOutline() {
  await changeReadingLayout({ outline: false })
  document.querySelector<HTMLButtonElement>('[aria-label="展开本页目录"]')?.focus()
}

function refresh() {
  if (!mounted || props.placement !== 'toolbar') return
  applyReadingLayout(isDoc.value)
  void nextTick(measureAvailability)
}

watch(() => route.path, () => { closePopover(); refresh() })
watch(isDoc, refresh)
onContentUpdated(refresh)
onMounted(() => {
  mounted = true
  if (props.placement !== 'toolbar') return
  loadReadingLayout()
  refresh()
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown, true)
  window.addEventListener('resize', positionPopover)
})
onBeforeUnmount(() => {
  if (props.placement !== 'toolbar') return
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown, true)
  window.removeEventListener('resize', positionPopover)
  applyReadingLayout(false)
})
</script>

<template>
  <div v-if="isDoc && placement === 'toolbar'" class="wk-reading-toolbar">
    <button v-if="hasSidebar && !readingLayout.sidebar" type="button" class="wk-reading-button wk-restore" aria-label="展开章节导航" @click="restoreSidebar">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m4-11 3 3-3 3"/></svg><span>章节</span>
    </button>
    <button v-if="hasOutline && !readingLayout.outline" type="button" class="wk-reading-button wk-restore" aria-label="展开本页目录" @click="restoreOutline">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"/></svg><span>目录</span>
    </button>
    <button ref="trigger" type="button" class="wk-reading-button wk-reading-trigger" aria-label="阅读设置" aria-haspopup="dialog" :aria-expanded="expanded" aria-controls="wk-reading-settings" @click="togglePopover">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h6m4 0h6M4 12h2m4 0h10M4 18h10m4 0h2"/><circle cx="12" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg><span>阅读设置</span>
    </button>
    <Teleport to="body">
      <div v-if="expanded" id="wk-reading-settings" ref="popover" class="wk-reading-popover" role="dialog" aria-labelledby="wk-reading-settings-title" :style="popoverPosition">
        <div id="wk-reading-settings-title" class="wk-reading-title">阅读设置</div>
        <div class="wk-width-label" id="wk-reading-width-label">正文宽度</div>
        <div class="wk-width-options" role="group" aria-labelledby="wk-reading-width-label">
          <button type="button" :aria-pressed="readingLayout.width === 'standard'" @click="changeReadingLayout({ width: 'standard' })"><span>标准</span></button>
          <button type="button" :aria-pressed="readingLayout.width === 'wide'" @click="changeReadingLayout({ width: 'wide' })"><span>较宽</span></button>
        </div>
        <div class="wk-reading-toggles">
          <div v-if="hasSidebar" class="wk-reading-row"><span id="wk-sidebar-setting">章节导航</span><button type="button" class="wk-reading-switch" role="switch" :aria-checked="readingLayout.sidebar" aria-labelledby="wk-sidebar-setting" @click="changeReadingLayout({ sidebar: !readingLayout.sidebar })"><span aria-hidden="true"></span></button></div>
          <div v-if="hasOutline" class="wk-reading-row"><span id="wk-outline-setting">本页目录</span><button type="button" class="wk-reading-switch" role="switch" :aria-checked="readingLayout.outline" aria-labelledby="wk-outline-setting" @click="changeReadingLayout({ outline: !readingLayout.outline })"><span aria-hidden="true"></span></button></div>
        </div>
        <button type="button" class="wk-reading-reset" @click="resetReadingLayout">恢复默认</button>
      </div>
    </Teleport>
  </div>
  <div v-else-if="isDoc && placement === 'sidebar'" class="wk-sidebar-heading">
    <div class="wk-side-tools"><span>章节导航</span><button type="button" class="wk-reading-icon-button" aria-label="收起章节导航" @click="hideSidebar"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m7-11-3 3 3 3"/></svg></button></div>
    <a :href="withBase('/')" class="wk-sidebar-back">← 返回首页</a>
  </div>
  <div v-else-if="isDoc && placement === 'outline'" class="wk-outline-tools">
    <button type="button" class="wk-reading-icon-button" aria-label="收起本页目录" @click="hideOutline"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M8 9l3 3-3 3"/></svg></button>
  </div>
</template>

<style scoped>
.wk-reading-toolbar { display:flex; align-items:center; gap:4px; margin-left:12px; }
.wk-reading-button,.wk-reading-icon-button { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:7px 9px; border:1px solid transparent; border-radius:7px; background:transparent; color:var(--vp-c-text-2); font:500 12px/20px var(--vp-font-family-base); cursor:pointer; }
.wk-reading-button:hover,.wk-reading-icon-button:hover { background:var(--vp-c-bg-soft); color:var(--vp-c-brand-1); }
.wk-reading-button:focus-visible,.wk-reading-icon-button:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:2px; }
.wk-reading-button svg,.wk-reading-icon-button svg { width:17px; height:17px; flex-shrink:0; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
.wk-reading-trigger[aria-expanded=true] { color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); }
.wk-reading-popover { position:fixed; z-index:80; width:280px; max-width:calc(100vw - 32px); max-height:calc(100dvh - 88px); overflow-y:auto; padding:16px; border:1px solid var(--vp-c-divider); border-radius:12px; background:var(--vp-c-bg); box-shadow:var(--vp-shadow-3); color:var(--vp-c-text-1); font:400 13px/22px var(--vp-font-family-base); }
.wk-reading-title { margin-bottom:16px; font-size:14px; font-weight:600; }
.wk-width-label { color:var(--vp-c-text-2); margin-bottom:8px; font-size:12px; }
.wk-width-options { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.wk-width-options button { display:flex; flex-direction:column; align-items:center; gap:2px; border:1px solid var(--vp-c-divider); border-radius:8px; padding:9px 8px; background:var(--vp-c-bg); color:var(--vp-c-text-2); cursor:pointer; }
.wk-width-options button[aria-pressed=true] { border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); color:var(--vp-c-brand-1); }
.wk-reading-toggles { margin-top:12px; }
.wk-reading-row { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:42px; }
.wk-reading-switch { position:relative; width:34px; height:20px; flex-shrink:0; padding:2px; border:1px solid var(--vp-c-divider); border-radius:12px; background:var(--vp-c-default-3, var(--vp-c-divider)); cursor:pointer; }
.wk-reading-switch span { display:block; width:14px; height:14px; border-radius:50%; background:var(--vp-c-bg); box-shadow:0 1px 2px #0002; transition:transform .15s; }
.wk-reading-switch[aria-checked=true] { border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-1); }
.wk-reading-switch[aria-checked=true] span { transform:translateX(14px); }
.wk-reading-reset { display:block; width:100%; margin-top:12px; border-top:1px solid var(--vp-c-divider); padding-top:12px; text-align:left; color:var(--vp-c-text-2); cursor:pointer; }
.wk-reading-reset:hover { color:var(--vp-c-brand-1); }
.wk-reading-popover button:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
.wk-side-tools { display:flex; align-items:center; justify-content:space-between; gap:8px; color:var(--vp-c-text-2); font-size:12px; }
.wk-reading-icon-button { width:30px; height:30px; padding:6px; }
.wk-sidebar-back { display:inline-block; margin:12px 0 18px; color:var(--vp-c-text-2); font-size:12px; line-height:24px; }
.wk-sidebar-back:hover { color:var(--vp-c-brand-1); }
.wk-outline-tools { position:absolute; z-index:3; top:8px; right:7px; }
@media(max-width:767px) {
  .wk-reading-toolbar { margin-left:0; gap:0; }
  .wk-reading-button { min-width:32px; padding:7px; }
  .wk-reading-button span { display:none; }
  .wk-reading-popover button { min-height:40px; }
  .wk-reading-popover .wk-reading-switch { min-height:20px; }
  .wk-reading-switch::after { content:''; position:absolute; inset:-11px -5px; }
  .wk-reading-icon-button { width:40px; height:40px; }
}
@media(prefers-reduced-motion:reduce) { .wk-reading-switch span { transition:none; } }
</style>
