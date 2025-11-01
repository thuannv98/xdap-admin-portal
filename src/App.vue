<script setup lang="ts">
import { computed } from 'vue';
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import SideBar from './components/SideBar.vue';
import TopBar from './components/TopBar.vue';

const sidebarOpen = ref(true);
// const isSidebarOpen = computed(() => sidebarOpen)

</script>

<template>
  <div class="app">
    <TopBar @sidebarOpen="sidebarOpen = !sidebarOpen"/>
    <div class="app-body">
      <SideBar v-model="sidebarOpen" />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-body {
  flex: 1;
  display: flex;
}
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.app-panel {
  background: var(--bg-main);
  box-shadow: var(--shadow-soft);
  border-radius: 12px;
  padding: 24px;
}
</style>
