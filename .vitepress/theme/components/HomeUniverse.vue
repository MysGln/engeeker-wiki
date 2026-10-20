<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'
import mascotImage from '../assets/hardshell-reading-v1.webp'
import cppImage from '../assets/subject-cpp-v2.webp'
import pythonImage from '../assets/subject-python-v2.webp'
import scratchImage from '../assets/subject-scratch-v2.webp'

const { isDark } = useData()
const universe = ref<HTMLElement>()
const paused = ref(false)
const reduced = ref(false)
const inView = ref(true)
const happy = ref(false)
const greeting = ref('')
const motionDescription = computed(() => reduced.value
  ? '系统已启用减少动态效果，当前为静态模式'
  : paused.value ? '恢复装饰动效' : '暂停装饰动效')
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
}
function resetParallax() {
  cancelAnimationFrame(frame)
  frame = lastFrame = 0
  target.x = target.y = position.x = position.y = velocity.x = velocity.y = 0
  paint()
}
function glide(time: number) {
  frame = 0
  if (paused.value || reduced.value || !inView.value) { lastFrame = 0; return }
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
  if (!frame && !paused.value && !reduced.value && inView.value) frame = requestAnimationFrame(glide)
}
function move(event: PointerEvent) {
  if (paused.value || reduced.value || event.pointerType === 'touch' || !universe.value) return
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
function setPaused(value: boolean) {
  paused.value = value || reduced.value
  if (paused.value) {
    resetParallax()
    cancelAnimationFrame(happyFrame)
    happyFrame = 0
    happy.value = false
    clearParticles()
  }
}
function preferenceChanged(event: MediaQueryListEvent) {
  reduced.value = event.matches
  setPaused(event.matches)
}
function say(text: string) {
  clearTimeout(bubbleTimer)
  cancelAnimationFrame(happyFrame)
  happy.value = false
  greeting.value = text
  if (!paused.value && !reduced.value && inView.value && universe.value) {
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
  reduced.value = preference.matches
  setPaused(preference.matches)
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
  <div ref="universe" class="wk-universe" :class="{ 'wk-dark': isDark, 'wk-paused': paused, 'wk-out-of-view': !inView }"
    aria-label="小硬壳的知识小宇宙" @pointermove="move" @pointerleave="leave">
    <div class="wk-atmosphere" aria-hidden="true"></div>
    <div class="wk-halo" aria-hidden="true"></div>
    <div class="wk-depth">
      <div class="wk-rings" aria-hidden="true">
        <div class="wk-ring"><div class="wk-ring-track"></div></div>
        <div class="wk-ring wk-ring-b"><div class="wk-ring-track"></div></div>
        <div class="wk-ring wk-ring-c"></div>
      </div>
      <span v-for="star in ['a','b','c','d','e']" :key="star" class="wk-star" :class="`wk-star-${star}`" aria-hidden="true"></span>
      <button type="button" class="wk-mascot" :class="{ 'wk-happy': happy }" aria-label="和正在读书的小硬壳打个招呼" @click="say('今天也一起探索新知识吧！')">
        <img :src="mascotImage" alt="戴蓝色耳机的绿色小硬壳，坐着翻阅书本" width="700" height="467" draggable="false" fetchpriority="high">
      </button>
      <div v-for="subject in subjects" :key="subject.key" class="wk-float-wrap" :class="`wk-token-${subject.key}`">
        <button type="button" class="wk-token" :aria-label="subject.label" @click="say(subject.greeting)">
          <img :src="subject.image" alt="" width="78" height="78" draggable="false">
          <span>{{ subject.name }}</span>
        </button>
      </div>
    </div>
    <div class="wk-bubble" :class="{ 'wk-show': greeting }" role="status" aria-live="polite">{{ greeting }}</div>
    <button v-if="!reduced" type="button" class="wk-motion" :aria-label="motionDescription" :title="motionDescription" :aria-pressed="paused" @click="setPaused(!paused)">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path v-if="paused" d="M5 3.5 12 8l-7 4.5Z" stroke-linejoin="round"/>
        <path v-else d="M5 3.5v9m6-9v9" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>

.wk-universe {
  --wk-bg: #fff; --wk-ink: #3c3c43; --wk-muted: #74777e;
  --wk-brand: #25824f; --wk-line: #e8ebe8; --wk-mint: #e7f5e9;
  --wk-tile: #fff; --wk-halo: #b5e7bc77; --wk-orbit: #90b89c6b;
  --wk-shadow: #29583c18; --wk-float: 12px;
  color: var(--wk-ink); isolation: isolate;
}
.wk-dark {
  --wk-bg: #1b1b1f; --wk-ink: #e3e7ec; --wk-muted: #adb6c3;
  --wk-brand: #77d49e; --wk-line: #313b41; --wk-mint: #254136;
  --wk-tile: #24302f; --wk-halo: #46b37d28; --wk-orbit: #74caa04d;
  --wk-shadow: #00000033;
}
.wk-dark .wk-token-python { --wk-subject-ink: #a3ceff; }
.wk-dark .wk-token-scratch { --wk-subject-ink: #ffc383; }
.wk-dark .wk-star-b { background: #e9ca76; }
.wk-dark .wk-star-d { background: #9abbec; }
.wk-universe *, .wk-universe *::before { box-sizing: border-box; }
.wk-universe button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.wk-universe button:focus-visible { outline: 3px solid var(--wk-brand); outline-offset: 5px; }
.wk-universe button:disabled { cursor: default; }
.wk-universe{position:relative;aspect-ratio:1.36;width:100%;max-width:510px;justify-self:center;--wk-mx:0;--wk-my:0;perspective:900px;touch-action:pan-y}
.wk-atmosphere{position:absolute;inset:11% 1% 9%;border-radius:50%;background:radial-gradient(ellipse at 50% 56%,var(--wk-halo) 0,transparent 68%);pointer-events:none}
.wk-halo{position:absolute;inset:34% 19% 10%;border-radius:50%;background:var(--wk-halo);filter:blur(26px);opacity:.65;pointer-events:none}
.wk-depth{position:absolute;inset:0;transform:rotateX(calc(var(--wk-my)*-1deg)) rotateY(calc(var(--wk-mx)*1.6deg));transform-style:preserve-3d}
.wk-rings{overflow:clip;overflow-clip-margin:12px;position:absolute;inset:13% 1% 9%;transform:translate(calc(var(--wk-mx)*-5px),calc(var(--wk-my)*-4px));pointer-events:none}
.wk-ring{position:absolute;border:1px solid var(--wk-orbit);border-radius:50%;width:100%;height:66%;left:0;top:22%;transform:rotate(-19deg)}
.wk-ring-b{width:78%;height:97%;left:11%;top:-3%;transform:rotate(39deg);border-style:dashed;opacity:.52}
.wk-ring-c{width:84%;height:83%;left:9%;top:7%;transform:rotate(-49deg);opacity:.33}
.wk-ring-track{position:absolute;inset:-3px;animation:wk-orbit-turn 32s linear infinite;border-radius:inherit}
.wk-ring-track::before{content:"";position:absolute;left:16%;top:12%;width:6px;height:6px;background:var(--wk-brand);border-radius:50%;box-shadow:0 0 0 5px var(--wk-mint)}
.wk-ring-b .wk-ring-track{animation-duration:43s;animation-direction:reverse}
.wk-ring-b .wk-ring-track::before{width:4px;height:4px;box-shadow:none;opacity:.7}
.wk-mascot{position:absolute;width:77%;left:11%;top:11%;padding:0;border:0;background:none;transform:translate(calc(var(--wk-mx)*7px),calc(var(--wk-my)*5px));border-radius:45%;z-index:3;line-height:0}
.wk-mascot img{display:block;width:100%;height:auto;animation:wk-hover 6s ease-in-out infinite;filter:drop-shadow(0 11px 12px var(--wk-shadow));user-select:none;-webkit-user-drag:none}
.wk-mascot:hover img{filter:drop-shadow(0 14px 18px var(--wk-shadow)) brightness(1.025)}
.wk-mascot.wk-happy img{animation:wk-bounce .65s cubic-bezier(.26,.6,.34,1) 1}
.wk-float-wrap{position:absolute;z-index:4;transform:translate(calc(var(--wk-mx)*-9px),calc(var(--wk-my)*-7px))}
.wk-token{display:flex;flex-direction:column;align-items:center;gap:1px;width:88px;min-height:94px;padding:0 4px 5px;border:0;border-radius:15px;background:transparent;color:var(--wk-brand);font:500 13px/1.4 'Merienda One',Arial,sans-serif;animation:wk-hover 6.7s ease-in-out infinite}
.wk-token img{display:block;width:78px;height:78px;object-fit:contain;scale:var(--wk-icon-scale,1.3);filter:drop-shadow(0 6px 6px var(--wk-shadow));transition:transform .38s cubic-bezier(.2,.7,.3,1),filter .38s ease;user-select:none;-webkit-user-drag:none}
.wk-token span{padding:0 4px;color:var(--wk-subject-ink,var(--wk-brand));text-shadow:0 1px 9px var(--wk-bg)}
.wk-token:hover img,.wk-token:focus-visible img{transform:translateY(-3px) scale(1.06);filter:drop-shadow(0 9px 9px var(--wk-shadow))}
.wk-token-cpp{left:0;top:5%}
.wk-token-python{right:0;top:15%;--wk-subject-ink:#35669a}
.wk-token-python button{animation-delay:-2.2s}
.wk-token-scratch{left:0;bottom:2%;--wk-icon-scale:1.05;--wk-subject-ink:#a45513}
.wk-token-scratch button{animation-delay:-4.2s}
.wk-star{position:absolute;border-radius:1px;pointer-events:none;z-index:2;background:var(--wk-brand);opacity:.4;animation:wk-twinkle 6s ease-in-out infinite}
.wk-star-a{width:4px;height:4px;left:35%;top:4%;transform:rotate(18deg)}
.wk-star-b{width:5px;height:5px;right:16%;top:10%;background:#d9b758;animation-delay:-2s}
.wk-star-c{width:3px;height:3px;left:7%;top:48%;animation-delay:-4s}
.wk-star-d{width:5px;height:5px;right:3%;top:54%;background:#8db5dd;animation-delay:-1s}
.wk-star-e{width:3px;height:3px;left:30%;bottom:5%;animation-delay:-3s}
.wk-bubble{position:absolute;z-index:6;left:50%;top:0;transform:translate(-50%,0);padding:6px 13px;border:1px solid var(--wk-line);border-radius:12px 12px 12px 3px;background:var(--wk-tile);box-shadow:0 4px 14px var(--wk-shadow);color:var(--wk-brand);font-size:12px;line-height:1.4;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s}
.wk-bubble.wk-show{opacity:1;transform:translate(-50%,-3px)}
.wk-motion{position:absolute;right:0;bottom:-26px;z-index:5;display:grid;place-items:center;width:32px;height:32px;border:0;background:transparent;border-radius:6px;padding:6px;color:var(--wk-muted)}
.wk-motion svg{width:13px;height:13px}
.wk-motion[aria-pressed=true]{color:var(--wk-brand)}
.wk-universe.wk-paused *,.wk-universe.wk-out-of-view *{animation-play-state:paused!important}
.wk-universe.wk-paused .wk-depth,.wk-universe.wk-paused .wk-rings,.wk-universe.wk-paused .wk-mascot,.wk-universe.wk-paused .wk-float-wrap,.wk-universe.wk-paused .wk-token img{transform:none!important}
:deep(.wk-spark){position:absolute;z-index:7;left:50%;top:45%;width:5px;height:5px;pointer-events:none;border-radius:1px;background:var(--wk-brand)}
@keyframes wk-hover{0%,100%{translate:0 0}50%{translate:0 calc(var(--wk-float)*-1)}}
@keyframes wk-orbit-turn{to{rotate:360deg}}
@keyframes wk-twinkle{0%,100%{opacity:.2}50%{opacity:.65}}
@keyframes wk-bounce{0%,100%{translate:0 0;rotate:0deg}30%{translate:0 -10px;rotate:-3deg}65%{translate:0 -3px;rotate:2deg}}
@media(pointer:coarse){.wk-token{position:relative}.wk-token::after{content:"";position:absolute;inset:-5px}.wk-motion{width:44px;height:44px;bottom:-33px}}
@media(prefers-reduced-motion:reduce){.wk-universe *,.wk-universe *::before{animation:none!important;transition:none!important}.wk-depth,.wk-rings,.wk-mascot,.wk-float-wrap,.wk-token img{transform:none!important}.wk-ring{transform:rotate(-19deg)!important}.wk-ring-b{transform:rotate(39deg)!important}.wk-ring-c{transform:rotate(-49deg)!important}:deep(.wk-spark){display:none}}
@media(max-width:680px) {
  .wk-universe { width: min(100%,390px); }
  .wk-token { width:64px;min-height:78px;padding:0 2px 3px;font-size:12px; }
  .wk-token img { width:58px;height:58px; }
  .wk-token-cpp { top:2%; } .wk-token-python { top:12%; }
  .wk-motion { right:2px; }
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
