<script setup>
import { computed } from 'vue'
import MNavLink from './MNavLink.vue'
const props = defineProps({
    title: String,
    items: Array
})
const formatTitle = computed(() => {
  return props.title
})
// console.log(1112222)
// console.log(props)
// console.log(formatTitle)
</script>

<template>
  <h2 v-if="title" :id="formatTitle" tabindex="-1">
      {{ props.title }}
      <a class="header-anchor" :href="`#${formatTitle}`" aria-hidden="true"></a>
  </h2>
  <div class="m-nav-links">
    <MNavLink
      v-for="{ icon, title, desc, link } in props.items"
      :key="link"
      :icon="icon"
      :title="title"
      :desc="desc"
      :link="link"
    />
  </div>
</template>

<style lang="scss" scoped>
.m-nav-links {
  --gap: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  grid-row-gap: var(--gap);
  grid-column-gap: var(--gap);
  grid-auto-flow: row dense;
  justify-content: center;
  margin-top: var(--gap);
}

@each $media, $size in (500px: 140px, 640px: 155px, 768px: 175px, 960px: 200px, 1440px: 240px) {
  @media (min-width: $media) {
    .m-nav-links {
      grid-template-columns: repeat(auto-fill, minmax($size, 1fr));
    }
  }
}

@media (min-width: 960px) {
  .m-nav-links {
    --gap: 20px;
  }
}
</style>
