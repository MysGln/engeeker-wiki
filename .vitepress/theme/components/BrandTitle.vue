<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <div class="wk-brand-title">
    <h1 class="wk-heading">
      <span class="wk-brand-name">硬壳编程 <span class="wk-guide">Guide<svg viewBox="0 0 150 20" fill="none" aria-hidden="true"><path d="M5 12C42 2 94 3 140 9M27 17C58 12 102 11 124 13" /></svg></span></span>
      <span class="wk-brand-subtitle">{{ frontmatter.hero?.text }}</span>
    </h1>
    <div class="wk-title-pixels" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  </div>
</template>

<style scoped>
.wk-brand-title {
  --wk-title-green:#22804e;
  --wk-title-lime:#83ae40;
  --wk-title-shine:#329c72;
  position:relative;
  width:fit-content;
  max-width:100%;
  isolation:isolate;
  margin-inline:auto;
}
.dark .wk-brand-title { --wk-title-green:#70cf96; --wk-title-lime:#c1dc7a; --wk-title-shine:#84d6c5; }
.wk-heading { display:flex; flex-direction:column; margin:0; font-size:32px; line-height:1.22; font-weight:700; letter-spacing:-.4px; }
.wk-brand-name { display:block; color:var(--wk-title-green); white-space:nowrap; background:linear-gradient(115deg,var(--wk-title-green) 5%,var(--wk-title-green) 30%,var(--wk-title-shine) 43%,var(--wk-title-lime) 50%,var(--wk-title-green) 64%,var(--wk-title-green) 100%); background-size:260% 100%; background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:wk-title-light 14s ease-in-out infinite; filter:drop-shadow(0 2px 0 color-mix(in srgb,var(--wk-title-green) 12%,transparent)); transition:filter .5s; }
.wk-guide { position:relative; display:inline-block; padding-bottom:.2em; }
.wk-guide svg { position:absolute; width:100%; height:.26em; left:0; bottom:0; stroke:var(--wk-title-lime); stroke-width:2; stroke-linecap:round; opacity:.7; }
.wk-brand-subtitle { color:var(--vp-c-text-1); font-size:clamp(18px,.56em,30px); line-height:1.5; font-weight:600; margin-top:16px; letter-spacing:0; }
.wk-title-pixels { position:absolute; inset:-20px -20px -20px; pointer-events:none; z-index:-1; }
.wk-title-pixels i { position:absolute; width:5px; height:5px; color:var(--wk-title-green); background:currentColor; opacity:.3; animation:wk-title-pixel 7s ease-in-out infinite; }
.wk-title-pixels i:nth-child(1) { right:2%; top:23%; box-shadow:7px -7px 0 color-mix(in srgb,currentColor 35%,transparent); }
.wk-title-pixels i:nth-child(2) { left:-1%; top:34%; width:3px; height:3px; animation-delay:-2s; }
.wk-title-pixels i:nth-child(3) { right:17%; bottom:4%; color:var(--wk-title-lime); width:4px; height:4px; animation-delay:-4s; }
.wk-title-pixels i:nth-child(4) { right:-3%; top:64%; width:3px; height:3px; animation-delay:-1s; }
.wk-title-pixels i:nth-child(5) { left:12%; top:0; color:var(--wk-title-lime); width:3px; height:3px; animation-delay:-5s; }
@keyframes wk-title-light { 0%,20%,100% { background-position:100% 50%; } 65%,80% { background-position:0% 50%; } }
@keyframes wk-title-pixel { 0%,100% { translate:0 3px; opacity:.18; } 50% { translate:0 -4px; opacity:.55; } }
@media(min-width:640px) { .wk-heading { font-size:48px; } }
@media(min-width:960px) { .wk-brand-title { margin-inline:0; } .wk-heading { font-size:clamp(40px,4.1vw,56px); } }
@media(max-width:359px) { .wk-heading { font-size:28px; } .wk-title-pixels { inset:-14px -8px; } }
@media(prefers-reduced-motion:reduce) { .wk-brand-name,.wk-title-pixels i { animation:none; transition:none; } }
</style>

<style>
/* The title and illustration respond as one homepage composition. */
.VPHomeHero:has(.wk-universe button:hover) .wk-brand-name,
.VPHomeHero:has(.wk-universe button:focus-visible) .wk-brand-name { filter:drop-shadow(0 0 12px color-mix(in srgb,var(--vp-c-brand-1) 20%,transparent)); }
.VPHomeHero:has(.wk-brand-title:hover) .wk-stream-haze { opacity:.4; }
.VPHomeHero:has(.wk-brand-title:hover) .wk-seed { filter:drop-shadow(0 0 6px #86c97770); }
</style>
