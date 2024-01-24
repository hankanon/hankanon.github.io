---
layout: home
layoutClass: m-nav-layout
---

<style src="./index.scss"></style>

<script setup>
import NavList from './components/MNavLinks.vue'

import { navData } from './data'
</script>

# 前端导航
<NavList v-for="(item,index) in navData" 
:title="item.title" 
:items="item.items" 
:key="index"></NavList>


