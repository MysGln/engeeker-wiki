<script setup lang="ts">
import { getScrollOffset, onContentUpdated, useRoute } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

type Point = { x: number; y: number }

// Keep VitePress links, but determine the reading position independently of its
// bottom-of-page shortcut, which skips child headings when anchors cannot align.
const route = useRoute()
const container = shallowRef<HTMLElement | null>(null)
const title = shallowRef<HTMLElement | null>(null)
const points = ref<Point[]>([])
const height = ref(0)
const startY = ref(0)
const current = ref(0)
const progress = ref(0)
const activePoint = computed(() => points.value[current.value] ?? points.value[0])
let article: HTMLElement | null = null
let links: HTMLAnchorElement[] = []
let headings: Array<HTMLElement | null> = []
let selectedId: string | null = null
let boundPath: string | null = null
let scrollIntent = false
let lastScrollY = 0
let outline: HTMLElement | null = null
let resizeObserver: ResizeObserver | undefined
let mutationObserver: MutationObserver | undefined
let frame = 0
let needsMeasure = false
let mounted = false
let bindingVersion = 0

const path = computed(() => {
  const entries = points.value
  if (!entries.length) return ''
  let d = `M ${entries[0].x} ${startY.value} L ${entries[0].x} ${entries[0].y}`
  for (let i = 1; i < entries.length; i++) {
    const a = entries[i - 1]
    const b = entries[i]
    if (a.x === b.x) {
      d += ` L ${b.x} ${b.y}`
      continue
    }
    const mid = (a.y + b.y) / 2
    const radius = Math.min(6, Math.abs(b.x - a.x) / 2, (b.y - a.y) / 4)
    const direction = Math.sign(b.x - a.x)
    d += ` L ${a.x} ${mid - radius} Q ${a.x} ${mid} ${a.x + direction * radius} ${mid}`
    d += ` L ${b.x - direction * radius} ${mid} Q ${b.x} ${mid} ${b.x} ${mid + radius} L ${b.x} ${b.y}`
  }
  return `${d} L ${entries[entries.length - 1].x} ${height.value - 2}`
})

function measure() {
  const content = container.value
  if (!content || !content.getClientRects().length) return
  links = Array.from(content.querySelectorAll<HTMLAnchorElement>('.outline-link'))
  headings = links.map(link => {
    try {
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)))
      return heading && article?.contains(heading) ? heading : null
    } catch {
      return null
    }
  })
  const rect = content.getBoundingClientRect()
  points.value = links.map(link => {
    const linkRect = link.getBoundingClientRect()
    return { x: linkRect.left - rect.left + 8, y: linkRect.top - rect.top + linkRect.height / 2 }
  })
  startY.value = links.length ? links[0].getBoundingClientRect().top - rect.top + 2 : 0
  height.value = content.scrollHeight
}

function update() {
  if (!article || !links.length) return
  let active = selectedId ? headings.findIndex(heading => heading?.id === selectedId) : -1
  if (active < 0) {
    const readingLine = getScrollOffset() + 4
    active = 0
    headings.forEach((heading, index) => {
      if (heading && heading.getBoundingClientRect().top <= readingLine) active = index
    })
  }
  current.value = active
  links.forEach((link, index) => {
    link.classList.toggle('wiki-outline-active', index === active)
    if (index === active) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
  const rect = article.getBoundingClientRect()
  const start = Math.max(0, rect.top + window.scrollY - getScrollOffset())
  const end = rect.bottom + window.scrollY - window.innerHeight
  const distance = end - start
  progress.value = distance <= 0
    ? 100
    : Math.min(100, Math.max(0, Math.round((window.scrollY - start) / distance * 100)))
}

function schedule(measureLayout = false) {
  needsMeasure ||= measureLayout
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    if (needsMeasure) measure()
    needsMeasure = false
    update()
  })
}

const onScroll = () => {
  if (scrollIntent && Math.abs(window.scrollY - lastScrollY) > 0.5) {
    selectedId = null
    scrollIntent = false
  }
  lastScrollY = window.scrollY
  schedule()
}
const onResize = () => schedule(true)
const onScrollIntent = () => { scrollIntent = true }
const onKeydown = (event: KeyboardEvent) => {
  if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return
  const target = event.target
  if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]')) return
  onScrollIntent()
}
const onPointerdown = (event: PointerEvent) => {
  if (event.clientX >= document.documentElement.clientWidth) onScrollIntent()
}

// At the page bottom several different anchors may share one scroll position.
// Keep the clicked heading selected until the reader actually scrolls again.
function onAnchorClick(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const target = event.target
  const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null
  if (!link?.hash || link.origin !== location.origin || link.pathname !== location.pathname) return
  selectHash(link.hash)
}

function decodeHash(hash: string) {
  try { return decodeURIComponent(hash.slice(1)) || null } catch { return null }
}

function selectHash(hash = location.hash) {
  const id = decodeHash(hash)
  selectedId = headings.some(heading => heading?.id === id) ? id : null
  scrollIntent = false
  schedule()
}

const onHistoryNavigation = () => selectHash()

function clearHighlight() {
  links.forEach(link => {
    link.classList.remove('wiki-outline-active')
    link.removeAttribute('aria-current')
  })
}

async function bindOutline() {
  const version = ++bindingVersion
  await nextTick()
  if (!mounted || version !== bindingVersion) return
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  clearHighlight()
  outline?.classList.remove('has-progress-line')
  outline = document.querySelector<HTMLElement>('.VPDocAsideOutline.has-outline')
  article = document.querySelector<HTMLElement>('.VPDoc .vp-doc')
  container.value = outline?.querySelector<HTMLElement>('.content') ?? null
  title.value = outline?.querySelector<HTMLElement>('.outline-title') ?? null
  outline?.classList.add('has-progress-line')
  points.value = []
  progress.value = 0
  links = []
  headings = []
  if (boundPath !== route.path) {
    selectedId = decodeHash(location.hash)
    boundPath = route.path
  }
  scrollIntent = false
  lastScrollY = window.scrollY
  if (article) resizeObserver?.observe(article)
  if (container.value) {
    resizeObserver?.observe(container.value)
    mutationObserver?.observe(container.value, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['class']
    })
  }
  schedule(true)
}

onContentUpdated(bindOutline)
onMounted(() => {
  mounted = true
  resizeObserver = new ResizeObserver(() => schedule(true))
  mutationObserver = new MutationObserver(records => schedule(records.some(record => record.type === 'childList')))
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('wheel', onScrollIntent, { passive: true })
  window.addEventListener('touchstart', onScrollIntent, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointerdown', onPointerdown, { passive: true })
  window.addEventListener('popstate', onHistoryNavigation)
  window.addEventListener('hashchange', onHistoryNavigation)
  document.addEventListener('click', onAnchorClick)
  bindOutline()
  document.fonts.ready.then(() => { if (mounted) schedule(true) })
})
onBeforeUnmount(() => {
  mounted = false
  bindingVersion++
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  clearHighlight()
  outline?.classList.remove('has-progress-line')
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('wheel', onScrollIntent)
  window.removeEventListener('touchstart', onScrollIntent)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onPointerdown)
  window.removeEventListener('popstate', onHistoryNavigation)
  window.removeEventListener('hashchange', onHistoryNavigation)
  document.removeEventListener('click', onAnchorClick)
})
</script>

<template>
  <Teleport v-if="container" :to="container">
    <svg v-if="path && activePoint" class="wiki-outline-trace" width="100%" :height="height" aria-hidden="true">
      <defs>
        <clipPath id="wiki-outline-progress-clip">
          <rect width="100%" :height="progress === 100 && current === points.length - 1 ? height : activePoint.y" />
        </clipPath>
      </defs>
      <path :d="path" class="wiki-outline-track" />
      <path :d="path" class="wiki-outline-read" clip-path="url(#wiki-outline-progress-clip)" />
      <circle :cx="activePoint.x" :cy="activePoint.y" r="8" class="wiki-outline-glow" />
      <circle :cx="activePoint.x" :cy="activePoint.y" r="3.5" class="wiki-outline-current" />
    </svg>
  </Teleport>
  <Teleport v-if="title" :to="title">
    <span class="wiki-outline-percentage" :aria-label="`阅读进度 ${progress}%`">{{ progress }}%</span>
  </Teleport>
</template>
