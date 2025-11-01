<script setup lang="ts">
import { defineEmits } from 'vue';
import Button from "primevue/button";

// const emit = defineEmits<{
//   (e: 'increment', value: number): void
// }>();

// function toggleSidebar() {
//   emit();
// }
</script>

<template>
  <header id="top-bar">
    <div class="left">
      <Button class="sidebar-toggle" icon="pi pi-bars"
        severity="info" size="small" variant="text" rounded
        @click="$emit('sidebarOpen')" aria-label="Open sidebar" />
      <img alt="logo" class="logo" src="@/assets/logo.png"/>
      <div class="name">XD Anton Padova</div>
    </div>
  </header>
</template>

<style scoped>
  #top-bar {
    /* background-color: white; */
    height: 60px;
    display: flex;
    justify-content: space-between;

  background: var(--bg-topbar);
  color: var(--text-dark);
  box-shadow: var(--shadow-soft);
  }
  .left {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .logo {
    width: 50px;
    height: 50px;
  }
  .name {
    font-size: large;
    font-weight: bold;
    font-style: italic;
    color: #2563eb;
  }

  @media (min-width: 769px) {
    .sidebar-toggle {
      display: none;
    }
  }
</style>
