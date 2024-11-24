<!--Layout.vue-->
<template>
    <Layout>
      <template #doc-footer-before> </template>
      <template #doc-after>
        <div style="margin-top: 24px">
          <Giscus
            :key="page.filePath"
            repo="hankanon/hankanon.github.io"
            repo-id="MDEwOlJlcG9zaXRvcnkxNDE4ODU0NDE="
            category="Show and tell"
            category-id="DIC_kwDOCHUAAc4Ckeje"
            mapping="pathname"
            strict="0"
            reactions-enabled="1"
            emit-metadata="0"
            input-position="bottom"
            lang="zh-CN"
            loading="lazy"
            crossorigin="anonymous"
            :theme="isDark ? 'dark' : 'light'"
            async
          />
        </div>
      </template>
    </Layout>
  </template>
  
  <script setup>
  import Giscus from "@giscus/vue";
  import DefaultTheme from "vitepress/theme";
  import { watch } from "vue";
  import { inBrowser, useData } from "vitepress";
  
  const { isDark, page } = useData();
  
  const { Layout } = DefaultTheme;
  
  watch(isDark, (dark) => {
    if (!inBrowser) return;
  
    const iframe = document
      .querySelector("giscus-widget")
      ?.shadowRoot?.querySelector("iframe");
  
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: dark ? "dark" : "light" } } },
      "https://giscus.app"
    );
  });
  </script>
  