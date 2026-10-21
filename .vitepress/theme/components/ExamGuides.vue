<script setup lang="ts">
import { useData, withBase } from 'vitepress'

const { frontmatter } = useData()
const icons: Record<string, string> = {
  levels: 'M5 20h6v-5H5zM11 20h6V9h-6zM17 20h6V3h-6z',
  checklist: 'M9 4h11v17H4V4h2M9 2h6v4H9zM8 10h8M8 14h8M8 18h5',
  code: 'm8 8-4 4 4 4m8-8 4 4-4 4M14 4l-4 16',
  trophy: 'M7 3h10v7a5 5 0 0 1-10 0zM7 5H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5M12 15v6m-4 0h8'
}
</script>

<template>
  <section v-if="frontmatter.examGuides?.length" class="wk-exams" aria-labelledby="wk-exams-title">
    <div class="wk-exams-inner">
      <h2 id="wk-exams-title">竞赛与考级指南</h2>
      <ul>
        <li v-for="guide in frontmatter.examGuides" :key="guide.title">
          <component :is="guide.link ? 'a' : 'article'" class="wk-exam-card" :href="guide.link ? withBase(guide.link) : undefined">
            <span class="wk-exam-icon" aria-hidden="true">
              <svg viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">
                <path :d="icons[guide.icon] || icons.levels" />
              </svg>
            </span>
            <h3>{{ guide.title }}</h3>
            <p v-if="guide.details">{{ guide.details }}</p>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>
