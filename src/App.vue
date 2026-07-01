<script setup lang="ts">
import TreeGrid from "./components/TreeGrid.vue"
import { demoItems } from "./data/mockItems"
</script>

<template>
  <main class="page">
    <h1>Тестовое задание MStroy</h1>
    <TreeGrid :items="demoItems" />
  </main>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
  padding: 24px;
}

h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
}
</style>
