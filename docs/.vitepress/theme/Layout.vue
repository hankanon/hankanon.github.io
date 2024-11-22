<template>
  <Layout>
    <template #doc-footer-before>
      <BackTop></BackTop>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from "vitepress/theme";
import BackTop from './components/backTop.vue';
const { Layout } = DefaultTheme;
</script>