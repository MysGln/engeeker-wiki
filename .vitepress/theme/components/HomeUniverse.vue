<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'
import mascotImage from '../assets/hardshell-reading-v1.webp'
import cppImage from '../assets/subject-cpp-v2.webp'
import pythonImage from '../assets/subject-python-v2.webp'
import scratchImage from '../assets/subject-scratch-v2.webp'

const { isDark } = useData()
const universe = ref<HTMLElement>()
const reduced = ref(false)
const inView = ref(true)
const happy = ref(false)
const greeting = ref('')
const subjects = [
  { name: 'C++', key: 'cpp', image: cppImage, greeting: '你好，C++！', label: '点亮 C++ 积木' },
  { name: 'Python', key: 'python', image: pythonImage, greeting: 'Hello, Python!', label: '点亮 Python 积木' },
  { name: 'Scratch', key: 'scratch', image: scratchImage, greeting: '用积木，把想法搭出来。', label: '点亮 Scratch 图形化编程积木' }
]
let frame = 0, happyFrame = 0, lastFrame = 0, bubbleTimer = 0
let observer: IntersectionObserver | undefined
let preference: MediaQueryList | undefined
const particles = new Map<HTMLElement, Animation>()
const target = { x: 0, y: 0 }, position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }

function paint() {
  universe.value?.style.setProperty('--wk-mx', position.x.toFixed(4))
  universe.value?.style.setProperty('--wk-my', position.y.toFixed(4))
  universe.value?.style.setProperty('--wk-glow-x', `${50 + position.x * 12}%`)
  universe.value?.style.setProperty('--wk-glow-y', `${52 + position.y * 10}%`)
}
function resetParallax() {
  cancelAnimationFrame(frame)
  frame = lastFrame = 0
  target.x = target.y = position.x = position.y = velocity.x = velocity.y = 0
  paint()
}
function glide(time: number) {
  frame = 0
  if (reduced.value || !inView.value) { lastFrame = 0; return }
  const dt = lastFrame ? Math.min((time - lastFrame) / 1000, 1 / 30) : 1 / 60
  lastFrame = time
  for (const axis of ['x', 'y'] as const) {
    velocity[axis] += ((target[axis] - position[axis]) * 70 - velocity[axis] * 16) * dt
    position[axis] += velocity[axis] * dt
  }
  const moving = Math.abs(target.x-position.x)+Math.abs(target.y-position.y)+Math.abs(velocity.x)+Math.abs(velocity.y) > .001
  if (!moving) { position.x = target.x; position.y = target.y; velocity.x = velocity.y = 0; lastFrame = 0 }
  paint()
  if (moving) frame = requestAnimationFrame(glide)
}
function scheduleGlide() {
  if (!frame && !reduced.value && inView.value) frame = requestAnimationFrame(glide)
}
function move(event: PointerEvent) {
  if (reduced.value || event.pointerType === 'touch' || !universe.value) return
  const box = universe.value.getBoundingClientRect()
  target.x = Math.max(-1, Math.min(1, (event.clientX-box.left)/box.width*2-1))
  target.y = Math.max(-1, Math.min(1, (event.clientY-box.top)/box.height*2-1))
  scheduleGlide()
}
function leave() { target.x = target.y = 0; scheduleGlide() }
function clearParticles() {
  particles.forEach((animation, element) => { animation.cancel(); element.remove() })
  particles.clear()
}
function setMotionPreference(value: boolean) {
  reduced.value = value
  if (value) {
    resetParallax()
    cancelAnimationFrame(happyFrame)
    happyFrame = 0
    happy.value = false
    clearParticles()
  }
}
function preferenceChanged(event: MediaQueryListEvent) {
  setMotionPreference(event.matches)
}
function say(text: string) {
  clearTimeout(bubbleTimer)
  cancelAnimationFrame(happyFrame)
  happy.value = false
  greeting.value = text
  if (!reduced.value && inView.value && universe.value) {
    happyFrame = requestAnimationFrame(() => { happyFrame = 0; happy.value = true })
    clearParticles()
    for (let i=0; i<9; i++) {
      const star = document.createElement('span')
      star.className = 'wk-spark'
      star.setAttribute('aria-hidden', 'true')
      star.style.background = ['var(--wk-brand)', '#d8b85a', '#82b3db'][i%3]
      universe.value.appendChild(star)
      const angle = i/9*Math.PI*2
      const animation = star.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
        { opacity: .8, offset: .2 },
        { transform: `translate(${Math.cos(angle)*92}px,${Math.sin(angle)*65-25}px) rotate(150deg)`, opacity: 0 }
      ], { duration: 720, easing: 'cubic-bezier(.15,.6,.3,1)' })
      particles.set(star, animation)
      animation.onfinish = () => { star.remove(); particles.delete(star) }
    }
  }
  bubbleTimer = window.setTimeout(() => { greeting.value = ''; happy.value = false }, 2300)
}
onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  setMotionPreference(preference.matches)
  preference.addEventListener('change', preferenceChanged)
  observer = new IntersectionObserver(([entry]) => {
    inView.value = entry.isIntersecting
    if (!inView.value) {
      resetParallax()
      cancelAnimationFrame(happyFrame)
      happyFrame = 0
      happy.value = false
      clearParticles()
    }
  })
  if (universe.value) observer.observe(universe.value)
})
onUnmounted(() => {
  cancelAnimationFrame(frame)
  cancelAnimationFrame(happyFrame)
  clearTimeout(bubbleTimer)
  clearParticles()
  observer?.disconnect()
  preference?.removeEventListener('change', preferenceChanged)
})
</script>

<template>
  <div ref="universe" class="wk-universe" :class="{ 'wk-dark': isDark, 'wk-reduced': reduced, 'wk-out-of-view': !inView }"
    aria-label="小硬壳的像素创作工坊" @pointermove="move" @pointerleave="leave">
    <div class="wk-atmosphere" aria-hidden="true"></div>
    <div class="wk-depth">
      <div class="wk-floor" aria-hidden="true"></div>
      <div class="wk-platform" aria-hidden="true"></div>
      <span v-for="star in ['a','b','c','d']" :key="star" class="wk-star" :class="`wk-star-${star}`" aria-hidden="true"></span>
      <button type="button" class="wk-mascot" :class="{ 'wk-happy': happy }" aria-label="和正在读书的小硬壳打个招呼" @click="say('今天也一起探索新知识吧！')">
        <img :src="mascotImage" alt="戴蓝色耳机的绿色小硬壳，坐着翻阅书本" width="700" height="467" draggable="false" fetchpriority="high">
      </button>
      <div v-for="subject in subjects" :key="subject.key" class="wk-float-wrap" :class="`wk-token-${subject.key}`">
        <button type="button" class="wk-token" :aria-label="subject.label" @click="say(subject.greeting)">
          <img :src="subject.image" alt="" width="78" height="78" draggable="false">
          <span>{{ subject.name }}</span>
        </button>
      </div>
      <span class="wk-code-note" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="m4 5 6 7-6 7M12 19h8" />
        </svg>
        Hello, idea!
      </span>
    </div>
    <div class="wk-bubble" :class="{ 'wk-show': greeting }" role="status" aria-live="polite">{{ greeting }}</div>
  </div>
</template>

<style scoped>
.wk-universe {
  --wk-bg: #fff;
  --wk-ink: #3c3c43;
  --wk-brand: #25824f;
  --wk-line: #e8ebe8;
  --wk-mint: #edf7ef;
  --wk-tile: #fff;
  --wk-halo: #d0efd775;
  --wk-grid: #9fc5a980;
  --wk-shadow: #1e583319;
  --wk-note-bg: #ffffffcc;
  --wk-scene-start: #f1faf4;
  --wk-scene-end: #fff;
  --wk-float: 12px;
  --wk-mx: 0;
  --wk-my: 0;
  --wk-glow-x: 50%;
  --wk-glow-y: 52%;
  position: relative;
  width: 100%;
  max-width: 510px;
  aspect-ratio: 1.2;
  border-radius: 20px;
  background: linear-gradient(125deg, var(--wk-scene-start), var(--wk-scene-end));
  color: var(--wk-ink);
  isolation: isolate;
  perspective: 900px;
  touch-action: pan-y;
}
.wk-dark {
  --wk-bg: #1b1b1f;
  --wk-ink: #e3e7ec;
  --wk-brand: #77d49e;
  --wk-line: #313b41;
  --wk-mint: #243a2e;
  --wk-tile: #24302f;
  --wk-halo: #47a46d30;
  --wk-grid: #81b79455;
  --wk-shadow: #00000040;
  --wk-note-bg: #242c27dd;
  --wk-scene-start: #1e2b23;
  --wk-scene-end: #1b1b1f;
}
.wk-dark .wk-token-python { --wk-subject-ink: #9dc8ef; }
.wk-dark .wk-token-scratch { --wk-subject-ink: #f9b67c; }
.wk-dark .wk-star-b { background: #dfbf75; }
.wk-dark .wk-star-c { background: #9dc8ef; }
.wk-universe *, .wk-universe *::before { box-sizing: border-box; }
.wk-universe button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.wk-universe button:focus-visible { outline: 3px solid var(--wk-brand); outline-offset: 5px; }
.wk-atmosphere {
  position: absolute;
  inset: 7% 0 5%;
  border-radius: 50%;
  background: radial-gradient(ellipse at var(--wk-glow-x) var(--wk-glow-y), var(--wk-halo), transparent 64%);
  pointer-events: none;
}
.wk-depth {
  position: absolute;
  inset: 0;
  transform: rotateX(calc(var(--wk-my) * -1deg)) rotateY(calc(var(--wk-mx) * 1.5deg));
  transform-style: preserve-3d;
}
.wk-floor {
  position: absolute;
  inset: 30% 6% 8%;
  border-radius: 30px;
  background-image: linear-gradient(var(--wk-grid) 1px, transparent 1px), linear-gradient(90deg, var(--wk-grid) 1px, transparent 1px);
  background-size: 23px 23px;
  transform: rotateX(58deg) rotateZ(-28deg);
  opacity: .4;
  mask-image: radial-gradient(ellipse, #000 20%, transparent 72%);
  pointer-events: none;
}
.wk-platform {
  position: absolute;
  left: 24%;
  right: 15%;
  bottom: 24%;
  height: 12%;
  border-radius: 22px;
  background: linear-gradient(145deg, color-mix(in srgb, var(--wk-brand) 18%, var(--wk-bg)), var(--wk-mint));
  transform: rotate(-8deg) skewX(-15deg);
  box-shadow: 0 10px 0 color-mix(in srgb, var(--wk-brand) 13%, var(--wk-bg)), 0 23px 25px var(--wk-shadow);
  opacity: .8;
  pointer-events: none;
}
.wk-mascot {
  position: absolute;
  width: 80%;
  left: 9%;
  top: 11%;
  padding: 0;
  border: 0;
  background: none;
  transform: translate(calc(var(--wk-mx) * 7px), calc(var(--wk-my) * 5px));
  border-radius: 45%;
  z-index: 3;
  line-height: 0;
}
.wk-mascot img {
  display: block;
  width: 100%;
  height: auto;
  animation: wk-hover 6s ease-in-out infinite;
  filter: drop-shadow(0 12px 17px var(--wk-shadow));
  user-select: none;
  -webkit-user-drag: none;
}
.wk-mascot:hover img { filter: drop-shadow(0 14px 18px var(--wk-shadow)) brightness(1.025); }
.wk-mascot.wk-happy img { animation: wk-bounce .65s cubic-bezier(.26, .6, .34, 1) 1; }
.wk-float-wrap {
  position: absolute;
  z-index: 4;
  transform: translate(calc(var(--wk-mx) * -7px), calc(var(--wk-my) * -6px));
}
.wk-token {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 74px;
  min-height: 89px;
  padding: 0 2px 5px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--wk-brand);
  font: 500 12px/1.4 'Merienda One', Arial, sans-serif;
  animation: wk-hover 6.5s ease-in-out infinite;
}
.wk-token img {
  display: block;
  width: 70px;
  height: 70px;
  object-fit: contain;
  scale: var(--wk-icon-scale, 1.2);
  filter: drop-shadow(0 6px 8px var(--wk-shadow));
  transition: transform .38s cubic-bezier(.2, .7, .3, 1), filter .38s ease;
  user-select: none;
  -webkit-user-drag: none;
}
.wk-token span { color: var(--wk-subject-ink, var(--wk-brand)); }
.wk-token:hover img, .wk-token:focus-visible img { transform: translateY(-3px) scale(1.06); }
.wk-token-cpp { left: 0; top: 9%; }
.wk-token-python { right: 0; top: 17%; --wk-subject-ink: #3b719f; }
.wk-token-python button { animation-delay: -2.2s; }
.wk-token-scratch { left: 5%; bottom: 5%; --wk-icon-scale: 1; --wk-subject-ink: #ab6024; }
.wk-token-scratch button { animation-delay: -4.1s; }
.wk-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--wk-brand);
  opacity: .35;
  animation: wk-twinkle 5s ease-in-out infinite;
  pointer-events: none;
}
.wk-star-a { left: 34%; top: 6%; rotate: 18deg; }
.wk-star-b { right: 16%; top: 10%; background: #b78a32; animation-delay: -2s; }
.wk-star-c { right: 3%; top: 58%; background: #3b719f; animation-delay: -1s; }
.wk-star-d { left: 25%; bottom: 6%; animation-delay: -3s; }
.wk-code-note {
  position: absolute;
  right: 4%;
  bottom: 4%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border: 1px solid var(--wk-grid);
  border-radius: 9px;
  background: var(--wk-note-bg);
  color: var(--wk-brand);
  font: 12px/1.4 'Merienda One', Arial, sans-serif;
  rotate: 4deg;
  animation: wk-hover 7s ease-in-out infinite;
  animation-delay: -3s;
  pointer-events: none;
}
.wk-code-note svg { width: 14px; height: 14px; }
.wk-bubble {
  position: absolute;
  z-index: 6;
  left: 50%;
  top: 0;
  transform: translate(-50%, 0);
  padding: 6px 13px;
  border: 1px solid var(--wk-line);
  border-radius: 12px 12px 12px 3px;
  background: var(--wk-tile);
  box-shadow: 0 4px 14px var(--wk-shadow);
  color: var(--wk-brand);
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s, transform .18s;
}
.wk-bubble.wk-show { opacity: 1; transform: translate(-50%, -3px); }
.wk-universe.wk-reduced *, .wk-universe.wk-out-of-view * { animation-play-state: paused !important; }
.wk-universe.wk-reduced :is(.wk-depth, .wk-mascot, .wk-float-wrap, .wk-token img) { transform: none !important; }
:deep(.wk-spark) { position: absolute; z-index: 7; left: 50%; top: 45%; width: 5px; height: 5px; pointer-events: none; border-radius: 1px; background: var(--wk-brand); }
@keyframes wk-hover { 0%, 100% { translate: 0 0; } 50% { translate: 0 calc(var(--wk-float) * -1); } }
@keyframes wk-twinkle { 0%, 100% { opacity: .18; } 50% { opacity: .55; } }
@keyframes wk-bounce { 0%, 100% { translate: 0 0; rotate: 0deg; } 30% { translate: 0 -10px; rotate: -3deg; } 65% { translate: 0 -3px; rotate: 2deg; } }
@media (pointer: coarse) {
  .wk-token { position: relative; }
  .wk-token::after { content: ''; position: absolute; inset: -5px; }
}
@media (max-width: 680px) {
  .wk-universe { width: min(100%, 390px); border-radius: 15px; }
  .wk-token { width: 56px; min-height: 74px; font-size: 11px; }
  .wk-token img { width: 53px; height: 53px; }
  .wk-code-note { right: 2%; bottom: 2%; padding: 6px 8px; font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .wk-universe *, .wk-universe *::before { animation: none !important; transition: none !important; }
  .wk-depth, .wk-mascot, .wk-float-wrap, .wk-token img { transform: none !important; }
  :deep(.wk-spark) { display: none; }
}
</style>


<style>
.VPHomeHero:has(.wk-universe) .container { align-items: center; }
.VPHomeHero:has(.wk-universe) .image { margin: 0 0 54px; width: 100%; }
.VPHomeHero:has(.wk-universe) .image-container { display:flex;justify-content:center;width:100%;height:auto;transform:none; }
@media(min-width:960px) {
  .VPHomeHero:has(.wk-universe) .container { gap:24px; }
  .VPHomeHero:has(.wk-universe) .main { flex:1 1 0; width:50%; }
  .VPHomeHero:has(.wk-universe) .image { flex:1 1 0; width:50%;margin:0 0 32px; }
}
</style>
