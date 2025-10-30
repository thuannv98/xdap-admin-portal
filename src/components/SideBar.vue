<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ isOpen: boolean }>()

const sidebarOpen = ref(true);
const menu = [
  { route: '/', icon: 'pi pi-check', label: 'Bảng điều khiển', perm: 'view_dashboard' },
  { route: '/', icon: 'pi pi-search', label: 'Chi Đoàn', perm: 'view_classes' },
  { route: '/', icon: 'pi pi-user', label: 'Ban Ngành', perm: 'manage_settings' },
  { route: '/', icon: 'pi pi-users', label: 'Đoàn Sinh', perm: 'view_students' },
  { route: '/', icon: 'huynhtruong.png', label: 'Huynh Trưởng', perm: 'view_students', customIcon: true },
];

const getCustomIcon = (fileName: string) => new URL(`../assets/icons/${fileName}`, import.meta.url).href;

</script>

<template>
  <aside id="sidebar" :class="['sidebar', { open: sidebarOpen }]">
    <button @click="sidebarOpen=!sidebarOpen" class="md:hidden text-gray-600">☰</button>
    <nav class="mt-4 space-y-2">
      <div class="sidebar-item" v-for="item in menu" :key="item.label">
        <img :src="getCustomIcon(item.icon)" class="icon-img" v-if="item.customIcon" />
        <i :class="item.icon" style="font-size: 1.2rem" v-else></i>
        <span v-if="sidebarOpen">{{item.label}}</span>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
  #sidebar {
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    border-radius: 8px;
    color: var(--text-muted);
    transition: background 0.2s, color 0.2s;
  }
  .sidebar-item:hover {
    background: var(--bg-active);
    color: var(--primary);
  }
  .sidebar-item.active {
    background: var(--bg-active);
    color: var(--primary);
  }
  .icon-img {
    width: 1.25rem; /* same size as pi icons */
    height: 1.25rem;
    vertical-align: middle;
  }
</style>
