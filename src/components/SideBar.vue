<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Button from "primevue/button";

const maximum = ref(true);
const isOpen = defineModel({ default: true });
const mq = window.matchMedia('(min-width: 768px)');

const handleResize = () => {
  isOpen.value = mq.matches;
  maximum.value = maximum.value || !mq.matches;
};

onMounted(() => {
  handleResize();
  mq.addEventListener('change', handleResize);
});

onUnmounted(() => {
  mq.removeEventListener('change', handleResize);
});

const menu = [
  { route: '/', icon: 'pi pi-home', label: 'Bảng điều khiển', perm: 'view_dashboard' },
  { route: '/chi-doan', icon: 'pi pi-address-book', label: 'Chi Đoàn', perm: 'view_classes' },
  { route: '/nganh', icon: 'pi pi-briefcase', label: 'Ngành', perm: 'manage_settings' },
  { route: '/ban', icon: 'pi pi-crown', label: 'Ban', perm: 'manage_settings' },
  { route: '/doan-sinh', icon: 'pi pi-users', label: 'Đoàn Sinh', perm: 'view_students' },
  { route: '/huynh-truong', icon: 'pi pi-graduation-cap', label: 'Huynh Trưởng', perm: 'view_students' },
  { route: '/ghi-chu', icon: 'pi pi-book', label: 'Ghi chú', perm: 'view_students' },
  { route: '/lich', icon: 'pi pi-calendar', label: 'Lịch', perm: 'view_students' },
  { route: '/message', icon: 'pi pi-envelope', label: 'Message', perm: 'view_students' },
];

const getCustomIcon = (fileName: string) => new URL(`../assets/icons/${fileName}`, import.meta.url).href;

</script>

<template>
  <aside id="sidebar" :class="['sidebar flex flex-col', { 'hidden': !isOpen }]">
    <div class="flex-1 p-3 shadow-(--shadow-soft)">
      
    <div :class="['toggle', { 'collapsed': !maximum }]">
      <Transition name="fade-slide">
        <span v-if="maximum" class="menu">Menu</span>
      </Transition>
      <Button :icon="maximum ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'"
        @click="maximum=!maximum" severity="info" rounded size="small" variant="outlined" aria-label="Toggle sidebar" />
    </div>
    <nav class="mt-4 space-y-2">
      <RouterLink v-for="item in menu" :to="item.route" :key="item.route" v-tooltip="item.label"
        :class="['sidebar-item', { active: item.route === $route.path || item.route !== '/' && $route.path.startsWith(item.route) }]">
        <i :class="item.icon" />
        <label :class="{ collapsed: !maximum }">{{item.label}}</label>
      </RouterLink>
    </nav>
    </div>
  </aside>
  <div v-if="isOpen" class="overlay" @click="isOpen=!isOpen"></div>
</template>

<style scoped>
  #sidebar {
    background-color: var(--bg-sidebar);
    /* padding: 10px; */
    font-weight: 500;
    transition: transform 0.3s ease;
    z-index: 999;
    color: #6b7280;
    /* padding-top: 0; */
  }
  #sidebar .logo {
    height: 100%;
    width: auto;
  }
  #sidebar.hidden {
    transform: translateX(-100%);
  }
  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 10px 12px;
    margin-bottom: 10px;
  }
  .menu {
    font-weight: 500;
  }
  .toggle i {
    cursor: pointer;
    border-radius: 50%;
    border-color: #e2e8f0;
  }
  .toggle.collapsed button {
    margin: 0 -4px;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin: 5px 0;
    gap: 6px;
    border-radius: 8px;
    color: var(--text-muted);
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
    overflow: hidden;
    text-decoration: none;
    border-left: 3px solid transparent;
  }
  .sidebar-item:hover {
    background-color: var(--bg-hover);
    color: var(--text-hover);
  }
  .sidebar-item.active, .sidebar-item:active {
    background-color: var(--bg-active);
    color: var(--primary);
  }
  .sidebar-item.active {
    border-left: 3px solid var(--primary);
  }
  .sidebar-item label {
    white-space: nowrap;
    opacity: 1;
    width: auto;
    cursor: pointer;
    transition: opacity 0.2s ease, width 0.3s ease, margin-left 0.3s ease;
  }
  .sidebar-item label.collapsed {
    opacity: 0;
    width: 0;
    margin-left: 0;
  }

  @media (min-width: 769px) {
    .overlay {
      display: none;
    }
  }
  /* Mobile */
  @media (max-width: 768px) {
    #sidebar {
      position: absolute;
      top: 0;
      height: 100vh;
      z-index: 999;
    }
    .toggle button {
      display: none;
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 998;
    }
  }
</style>
