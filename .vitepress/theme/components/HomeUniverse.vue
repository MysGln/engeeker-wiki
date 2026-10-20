<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import mascotImage from '../assets/hardshell-reading-v1.webp'
import cppImage from '../assets/subject-cpp-v2.webp'
import pythonImage from '../assets/subject-python-v2.webp'
import scratchImage from '../assets/subject-scratch-v2.webp'

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
// Deterministic positions keep the static page and client render identical.
const stars = Array.from({ length: 28 }, (_, i) => {
  const angle = i * 2.39996
  const radius = .67 + (i % 5) * .065
  return {
    x: 50 + Math.cos(angle) * 44 * radius,
    y: 48 + Math.sin(angle) * 43 * radius,
    size: i % 6 === 0 ? 7 : i % 3 === 0 ? 3 : 1.8,
    delay: -(i * .71), duration: 3.5 + (i % 5) * .8,
    color: ['mint', 'blue', 'gold'][i % 3], cross: i % 6 === 0
  }
})
const streams = [
  { key: 'mint', d: 'M 210 292 C 113 301 35 210 75 128 C 96 85 157 52 218 60' },
  { key: 'blue', d: 'M 272 275 C 374 308 467 235 445 164 C 431 113 402 90 363 81' },
  { key: 'gold', d: 'M 183 285 C 191 355 337 384 402 331 C 438 302 434 277 421 260' }
]
let frame = 0, happyFrame = 0, lastFrame = 0, bubbleTimer = 0
let orbitFrame = 0, orbitLastTime = 0, orbitTime = 0
let orbitWidth = 510, orbitHeight = 425
let orbitTokens: HTMLElement[] = []
let sizeObserver: ResizeObserver | undefined
let observer: IntersectionObserver | undefined
let preference: MediaQueryList | undefined
const particles = new Map<HTMLElement, Animation>()
const target = { x: 0, y: 0 }, position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }

// Each subject drifts in its own area instead of circling on one rigid ring.
// Keeping the subjects apart also makes their labels and click targets predictable.
function paintOrbit() {
  const anchors = [
    { x: -.36, y: -.24, phase: .4, period: 25 },
    { x: .35, y: -.21, phase: 2.1, period: 31 },
    { x: -.29, y: .31, phase: 4.3, period: 28 }
  ]
  orbitTokens.forEach((element, index) => {
    const anchor = anchors[index]
    const angle = orbitTime * Math.PI * 2 / anchor.period + anchor.phase
    const dx = Math.cos(angle) * .025
    const dy = Math.sin(angle) * .025
    element.style.setProperty('--wk-orbit-x', `${((anchor.x + dx) * orbitWidth).toFixed(2)}px`)
    element.style.setProperty('--wk-orbit-y', `${((anchor.y + dy) * orbitHeight).toFixed(2)}px`)
    element.style.setProperty('--wk-orbit-scale', (.97 + Math.sin(angle) * .025).toFixed(3))
  })
}
function orbit(time: number) {
  orbitFrame = 0
  if (reduced.value || !inView.value) { orbitLastTime = 0; return }
  if (orbitLastTime) orbitTime += Math.min(time - orbitLastTime, 64) / 1000
  orbitLastTime = time
  paintOrbit()
  orbitFrame = requestAnimationFrame(orbit)
}
function startOrbit() {
  if (!orbitFrame && !reduced.value && inView.value) orbitFrame = requestAnimationFrame(orbit)
}
function stopOrbit() {
  cancelAnimationFrame(orbitFrame)
  orbitFrame = orbitLastTime = 0
}
function paint() {
  universe.value?.style.setProperty('--wk-mx', position.x.toFixed(4))
  universe.value?.style.setProperty('--wk-my', position.y.toFixed(4))
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
    stopOrbit()
    resetParallax()
    cancelAnimationFrame(happyFrame)
    happyFrame = 0
    happy.value = false
    clearParticles()
  } else startOrbit()
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
  if (universe.value) {
    orbitTokens = Array.from(universe.value.querySelectorAll<HTMLElement>('.wk-float-wrap'))
    orbitWidth = universe.value.clientWidth
    orbitHeight = universe.value.clientHeight
    paintOrbit()
    sizeObserver = new ResizeObserver(([entry]) => {
      orbitWidth = entry.contentRect.width
      orbitHeight = entry.contentRect.height
      paintOrbit()
    })
    sizeObserver.observe(universe.value)
  }
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  setMotionPreference(preference.matches)
  preference.addEventListener('change', preferenceChanged)
  observer = new IntersectionObserver(([entry]) => {
    inView.value = entry.isIntersecting
    if (!inView.value) {
      stopOrbit()
      resetParallax()
      cancelAnimationFrame(happyFrame)
      happyFrame = 0
      happy.value = false
      clearParticles()
    } else startOrbit()
  })
  if (universe.value) observer.observe(universe.value)
})
onUnmounted(() => {
  stopOrbit()
  sizeObserver?.disconnect()
  cancelAnimationFrame(frame)
  cancelAnimationFrame(happyFrame)
  clearTimeout(bubbleTimer)
  clearParticles()
  observer?.disconnect()
  preference?.removeEventListener('change', preferenceChanged)
})
</script>

<template>
  <div ref="universe" class="wk-universe" :class="{ 'wk-reduced': reduced, 'wk-out-of-view': !inView }"
    aria-label="小硬壳的像素创作工坊" @pointermove="move" @pointerleave="leave">
    <div class="wk-atmosphere" aria-hidden="true">
      <span class="wk-nebula wk-nebula-mint"></span>
      <span class="wk-nebula wk-nebula-blue"></span>
      <span class="wk-nebula wk-nebula-gold"></span>
    </div>
    <div class="wk-depth">
      <div class="wk-cosmos" aria-hidden="true">
        <svg class="wk-streams" viewBox="0 0 510 425" fill="none">
          <defs>
            <linearGradient id="wk-stream-mint" x1="0" y1="1" x2="1" y2="0">
              <stop stop-color="var(--wk-brand)" stop-opacity="0" />
              <stop offset=".45" stop-color="var(--wk-brand)" stop-opacity=".65" />
              <stop offset="1" stop-color="var(--wk-blue)" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="wk-stream-blue" x1="1" y1="0" x2="0" y2="1">
              <stop stop-color="var(--wk-blue)" stop-opacity="0" />
              <stop offset=".45" stop-color="var(--wk-blue)" stop-opacity=".6" />
              <stop offset="1" stop-color="var(--wk-brand)" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="wk-stream-gold" x1="0" y1="1" x2="1" y2="0">
              <stop stop-color="var(--wk-gold)" stop-opacity="0" />
              <stop offset=".5" stop-color="var(--wk-gold)" stop-opacity=".6" />
              <stop offset="1" stop-color="var(--wk-brand)" stop-opacity="0" />
            </linearGradient>
          </defs>
          <g v-for="(stream, i) in streams" :key="stream.key" :class="`wk-stream-${stream.key}`" :style="{ '--wk-stream-delay': `${-i * 4}s` }">
            <path class="wk-stream-haze" :d="stream.d" :stroke="`url(#wk-stream-${stream.key})`" />
            <path class="wk-stream-line" :d="stream.d" :stroke="`url(#wk-stream-${stream.key})`" />
            <path class="wk-stream-glint" :d="stream.d" pathLength="100" />
          </g>
        </svg>
        <span v-for="(star, i) in stars" :key="i" class="wk-star" :class="[`wk-star-${star.color}`, { 'wk-star-cross': star.cross }]"
          :style="{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`, '--wk-star-delay': `${star.delay}s`, '--wk-star-duration': `${star.duration}s` }"></span>
      </div>
      <div class="wk-seeds" aria-hidden="true">
        <svg class="wk-seed wk-seed-sprout" viewBox="0 0 64 64">
          <path fill="#318251" d="M28 30h8v24h-8zM12 12h16v8h8v16H20v-8h-8zm24 8h8v-8h12v16h-8v8H36z"/>
          <path fill="#b9d974" d="M12 12h16v8h-8v8h-8zm32 0h12v8H44z"/>
          <path fill="#74b768" d="M20 20h8v8h8v8H20zm16 8h12v8H36z"/>
        </svg>
        <svg class="wk-seed wk-seed-cube" viewBox="0 0 48 48">
          <path fill="#b9d977" d="m24 4 18 10-18 10L6 14z"/><path fill="#65a466" d="m6 14 18 10v21L6 35z"/><path fill="#2d7954" d="m24 24 18-10v21L24 45z"/>
          <path fill="#eff0b4" d="m16 10 8-4 8 4-8 5z"/><path stroke="#cae6a3" stroke-width="2" d="m10 19 10 6v12" fill="none"/>
        </svg>
        <svg class="wk-seed wk-seed-code" viewBox="0 0 58 36" fill="none">
          <path d="m18 8-10 10 10 10m22-20 10 10-10 10M33 4l-8 28" stroke="currentColor" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter"/>
        </svg>
      </div>
      <div class="wk-mascot" :class="{ 'wk-happy': happy }">
        <img :src="mascotImage" alt="戴蓝色耳机的绿色小硬壳，坐着翻阅书本" width="700" height="467" draggable="false" fetchpriority="high">
        <button type="button" class="wk-mascot-hit" aria-label="和正在读书的小硬壳打个招呼" @click="say('今天也一起探索新知识吧！')"></button>
      </div>
      <div v-for="subject in subjects" :key="subject.key" class="wk-float-wrap" :class="`wk-token-${subject.key}`">
        <button type="button" class="wk-token" :aria-label="subject.label" @click="say(subject.greeting)">
          <img :src="subject.image" alt="" width="78" height="78" draggable="false">
          <span>{{ subject.name }}</span>
        </button>
      </div>
    </div>
    <div class="wk-bubble" :class="{ 'wk-show': greeting }" role="status" aria-live="polite">{{ greeting }}</div>
  </div>
</template>

<style scoped>
.wk-universe {
  --wk-ink: #3c3c43;
  --wk-brand: #25824f;
  --wk-line: #e8ebe8;
  --wk-tile: #fff;
  --wk-halo: #63c99e40;
  --wk-blue: #4e91c1;
  --wk-gold: #bd9148;
  --wk-cloud-blue: #70bce730;
  --wk-cloud-gold: #e9c77529;
  --wk-star-opacity: .6;
  --wk-shadow: #1e583319;
  --wk-float: 12px;
  --wk-mx: 0;
  --wk-my: 0;
  position: relative;
  width: 100%;
  max-width: 510px;
  aspect-ratio: 1.2;
  container-type: inline-size;
  background: transparent;
  color: var(--wk-ink);
  isolation: isolate;
  perspective: 900px;
  touch-action: pan-y;
}
/* Follow VitePress’s document theme before hydration and on every toggle. */
.dark .wk-universe {
  --wk-ink: #e3e7ec;
  --wk-brand: #77d49e;
  --wk-line: #313b41;
  --wk-tile: #24302f;
  --wk-halo: #4bd29a32;
  --wk-blue: #8bc8ec;
  --wk-gold: #f4cf88;
  --wk-cloud-blue: #509de32b;
  --wk-cloud-gold: #dfb5581c;
  --wk-star-opacity: .85;
  --wk-shadow: #00000040;
}
.dark .wk-universe .wk-token-python { --wk-subject-ink: #9dc8ef; }
.dark .wk-universe .wk-token-scratch { --wk-subject-ink: #f9b67c; }
.wk-universe *, .wk-universe *::before { box-sizing: border-box; }
.wk-universe button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.wk-universe button:focus-visible { outline: 3px solid var(--wk-brand); outline-offset: 5px; }
.wk-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform: translate(calc(var(--wk-mx) * -4px), calc(var(--wk-my) * -3px));
}
.wk-nebula {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--wk-cloud) 0%, transparent 69%);
  animation: wk-nebula-breathe 12s ease-in-out infinite alternate;
}
.wk-nebula-mint { --wk-cloud: var(--wk-halo); width: 78%; height: 88%; left: 8%; top: 5%; rotate: -26deg; }
.wk-nebula-blue { --wk-cloud: var(--wk-cloud-blue); width: 55%; height: 80%; right: 3%; top: 13%; rotate: 31deg; animation-delay: -5s; }
.wk-nebula-gold { --wk-cloud: var(--wk-cloud-gold); width: 57%; height: 42%; left: 12%; bottom: 7%; rotate: -20deg; animation-delay: -9s; }
.wk-depth {
  position: absolute;
  inset: 0;
  /* Flat stacking keeps every decorative trail behind the opaque character. */
  isolation: isolate;
  transform: translate(calc(var(--wk-mx) * 3px), calc(var(--wk-my) * 2px));
}
.wk-cosmos { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.wk-streams { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.wk-streams path { vector-effect: non-scaling-stroke; stroke-linecap: round; }
.wk-stream-haze { stroke-width: 9; opacity: .18; filter: blur(4px); transition:opacity .6s; }
.wk-stream-line { stroke-width: 1; opacity: .62; }
.wk-stream-glint {
  stroke: var(--wk-stream-color, var(--wk-brand));
  stroke-width: 1.5;
  stroke-dasharray: 1.5 98.5;
  stroke-dashoffset: 100;
  animation: wk-comet 14s linear infinite;
  animation-delay: var(--wk-stream-delay);
  filter: drop-shadow(0 0 3px var(--wk-stream-color, var(--wk-brand)));
}
.wk-stream-blue { --wk-stream-color: var(--wk-blue); }
.wk-stream-gold { --wk-stream-color: var(--wk-gold); }
.wk-seeds { position:absolute; inset:0; z-index:1; pointer-events:none; }
.wk-seed { position:absolute; width:32px; height:32px; filter:drop-shadow(0 5px 7px var(--wk-shadow)); animation:wk-seed-drift 9s ease-in-out infinite; transition:filter .5s; }
.wk-seed-sprout { left:43%; top:2%; width:37px; height:37px; rotate:16deg; }
.wk-seed-cube { right:13%; bottom:14%; rotate:-12deg; animation-delay:-3s; }
.wk-seed-code { left:9%; top:47%; width:29px; height:22px; color:var(--wk-brand); opacity:.55; rotate:-14deg; animation-delay:-6s; }
@keyframes wk-seed-drift { 0%,100% { translate:0 3px; } 50% { translate:3px -6px; } }
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
.wk-mascot { pointer-events: none; }
.wk-mascot-hit {
  position: absolute;
  left: 32%;
  top: 24%;
  width: 48%;
  height: 68%;
  border: 0;
  border-radius: 40%;
  background: transparent;
  pointer-events: auto;
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
  left: 50%;
  top: 48%;
  z-index: 4;
  transform: translate(-50%, -50%) translate(calc(var(--wk-orbit-x) + var(--wk-mx) * -7px), calc(var(--wk-orbit-y) + var(--wk-my) * -6px)) scale(var(--wk-orbit-scale));
  will-change: transform;
}
.wk-token {
  position: relative;
  isolation: isolate;
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

}
.wk-token::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -15% -28% 0;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--wk-subject-ink, var(--wk-brand)) 20%, transparent), transparent 65%);
  opacity: .55;
  transition: opacity .35s;
  pointer-events: none;
}
.wk-token:hover::before, .wk-token:focus-visible::before { opacity: 1; }
.wk-token img {
  display: block;
  width: 70px;
  height: 70px;
  object-fit: contain;
  scale: var(--wk-icon-scale, 1.2);
  filter: drop-shadow(0 5px 7px var(--wk-shadow));
  transition: transform .38s cubic-bezier(.2, .7, .3, 1), filter .38s ease;
  user-select: none;
  -webkit-user-drag: none;
}
.wk-token span { color: var(--wk-subject-ink, var(--wk-brand)); }
.wk-token:hover img, .wk-token:focus-visible img { transform: translateY(-3px) scale(1.06); }
.wk-token-cpp { --wk-orbit-x: -34cqw; --wk-orbit-y: -19cqw; --wk-orbit-scale: .98; }
.wk-token-python { --wk-orbit-x: 34cqw; --wk-orbit-y: -16cqw; --wk-orbit-scale: .99; --wk-subject-ink: #3b719f; }
.wk-token-scratch { --wk-orbit-x: -30cqw; --wk-orbit-y: 24cqw; --wk-orbit-scale: .95; --wk-icon-scale: 1; --wk-subject-ink: #ab6024; }
.wk-star {
  position: absolute;
  border-radius: 0;
  color: var(--wk-brand);
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  opacity: .4;
  animation: wk-twinkle var(--wk-star-duration) ease-in-out infinite;
  animation-delay: var(--wk-star-delay);
}
.wk-star-blue { color: var(--wk-blue); }
.wk-star-gold { color: var(--wk-gold); }
.wk-star-cross {
  border-radius: 0;
  clip-path: polygon(35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%);
}
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
.wk-universe.wk-reduced :is(.wk-depth, .wk-mascot, .wk-token img) { transform: none !important; }
:deep(.wk-spark) { position: absolute; z-index: 7; left: 50%; top: 45%; width: 5px; height: 5px; pointer-events: none; border-radius: 1px; background: var(--wk-brand); }
@keyframes wk-hover { 0%, 100% { translate: 0 0; } 50% { translate: 0 calc(var(--wk-float) * -1); } }
@keyframes wk-twinkle { 0%, 100% { opacity: .15; scale: .7; } 50% { opacity: var(--wk-star-opacity); scale: 1.1; } }
@keyframes wk-nebula-breathe { from { opacity: .65; scale: .94; } to { opacity: 1; scale: 1.06; } }
@keyframes wk-comet { 0% { stroke-dashoffset: 100; opacity: 0; } 12%, 72% { opacity: .85; } 92%, 100% { stroke-dashoffset: 0; opacity: 0; } }
@keyframes wk-bounce { 0%, 100% { translate: 0 0; rotate: 0deg; } 30% { translate: 0 -10px; rotate: -3deg; } 65% { translate: 0 -3px; rotate: 2deg; } }
@media (pointer: coarse) {
  .wk-token { position: relative; }
  .wk-token::after { content: ''; position: absolute; inset: -5px; }
}
@media (max-width: 680px) {
  .wk-universe { width: min(100%, 390px); }
  .wk-token { width: 56px; min-height: 74px; font-size: 11px; }
  .wk-token img { width: 53px; height: 53px; }
}
@media (prefers-reduced-motion: reduce) {
  .wk-universe *, .wk-universe *::before { animation: none !important; transition: none !important; }
  .wk-depth, .wk-mascot, .wk-token img { transform: none !important; }
  :deep(.wk-spark), .wk-stream-glint { display: none; }
}
</style>


<style>
.VPHomeHero:has(.wk-universe) .container { align-items: center; }
.VPHomeHero:has(.wk-universe) .image { margin: 0 0 26px; width: 100%; }
.VPHomeHero:has(.wk-universe) .image-container { display:flex;justify-content:center;width:100%;height:auto;transform:none; }
@media(min-width:960px) {
  .VPHomeHero:has(.wk-universe) .container { gap:24px; }
  .VPHomeHero:has(.wk-universe) .main { flex:1 1 0; width:50%; }
  .VPHomeHero:has(.wk-universe) .image { flex:1 1 0; width:50%;margin:0 0 32px; }
}
</style>
