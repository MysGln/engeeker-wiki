<script setup lang="ts">
import { getScrollOffset, onContentUpdated } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

type Point = { x: number; y: number }

// Enhance the default outline so VitePress keeps control of links and active anchors.
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
  const active = links.findIndex(link => link.classList.contains('active'))
  current.value = active < 0 ? 0 : active
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

const onScroll = () => schedule()
const onResize = () => schedule(true)

async function bindOutline() {
  const version = ++bindingVersion
  await nextTick()
  if (!mounted || version !== bindingVersion) return
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  outline?.classList.remove('has-progress-line')
  outline = document.querySelector<HTMLElement>('.VPDocAsideOutline.has-outline')
  article = document.querySelector<HTMLElement>('.VPDoc .vp-doc')
  container.value = outline?.querySelector<HTMLElement>('.content') ?? null
  title.value = outline?.querySelector<HTMLElement>('.outline-title') ?? null
  outline?.classList.add('has-progress-line')
  points.value = []
  progress.value = 0
  links = []
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
  bindOutline()
  document.fonts.ready.then(() => { if (mounted) schedule(true) })
})
onBeforeUnmount(() => {
  mounted = false
  bindingVersion++
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  outline?.classList.remove('has-progress-line')
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <Teleport v-if="container" :to="container">
    <svg v-if="path && activePoint" class="wiki-outline-trace" width="100%" :height="height" aria-hidden="true">
      <defs>
        <clipPath id="wiki-outline-progress-clip">
          <rect width="100%" :height="progress === 100 ? height : activePoint.y" />
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
