---
layoutClass: m-tool-layout
outline: [2, 3, 4]
---

<style src="./index.scss"></style>

<script setup>
import NavList from './components/MNavLinks.vue'

import { navData } from './data'
</script>

# 前端导航
<div class="container">
    <NavList 
        v-for="(item,index) in navData" 
        :title="item.title" 
        :items="item.items" 
        :key="index">
    </NavList>
</div>


