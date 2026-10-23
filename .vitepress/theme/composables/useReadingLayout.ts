import { nextTick, reactive } from 'vue'

export type ReadingWidth = 'standard' | 'wide'
const storageKey = 'engeeker-wiki-reading-v1'
export const readingLayout = reactive({ width: 'wide' as ReadingWidth, sidebar: true, outline: true })

export function loadReadingLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (!saved || typeof saved !== 'object') return
    if (saved.width === 'standard' || saved.width === 'wide') readingLayout.width = saved.width
    if (typeof saved.sidebar === 'boolean') readingLayout.sidebar = saved.sidebar
    if (typeof saved.outline === 'boolean') readingLayout.outline = saved.outline
  } catch { /* Storage can be unavailable in private or restricted browsers. */ }
}

export function applyReadingLayout(enabled: boolean) {
  const data = document.documentElement.dataset
  if (!enabled) {
    delete data.wikiReading
    delete data.wikiWidth
    delete data.wikiSidebar
    delete data.wikiOutline
    return
  }
  data.wikiReading = ''
  data.wikiWidth = readingLayout.width
  data.wikiSidebar = readingLayout.sidebar ? 'show' : 'hide'
  data.wikiOutline = readingLayout.outline ? 'show' : 'hide'
}

export async function changeReadingLayout(update: Partial<typeof readingLayout>) {
  // Keep the paragraph being read in place when changing line wrapping or columns.
  const line = 130
  const anchor = window.scrollY > 100
    ? Array.from(document.querySelectorAll<HTMLElement>('.vp-doc :is(h1,h2,h3,h4,p,pre,table)'))
      .find(element => element.getBoundingClientRect().bottom > line)
    : undefined
  const top = anchor?.getBoundingClientRect().top
  Object.assign(readingLayout, update)
  applyReadingLayout(true)
  try { localStorage.setItem(storageKey, JSON.stringify(readingLayout)) } catch { /* Keep session controls usable. */ }
  await nextTick()
  if (anchor && top !== undefined && anchor.isConnected) {
    window.scrollBy({ top: anchor.getBoundingClientRect().top - top, behavior: 'instant' })
  }
}

export function resetReadingLayout() {
  return changeReadingLayout({ width: 'wide', sidebar: true, outline: true })
}
