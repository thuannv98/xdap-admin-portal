<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

import SideBar from './components/SideBar.vue';
import TopBar from './components/TopBar.vue';
import Breadcrumb from './components/Breadcrumb.vue';
import Loading from './components/Loading.vue';
import { useAppReadyStore, useLoadingStore } from './stores/app';

const loading = useLoadingStore();
const appReady = useAppReadyStore();
const sidebarOpen = ref(true);

const route = useRoute()

</script>

<template>
  <div v-if="appReady.appReady">
    <div v-if="!route.meta.isActionPage" class="flex h-screen flex-col">
      <TopBar @sidebarOpen="sidebarOpen = !sidebarOpen"/>
      <div class="min-h-0 flex flex-1">
        <SideBar v-model="sidebarOpen" />
        <main class="min-w-0 flex-1 overflow-y-auto">
          <Breadcrumb></Breadcrumb>
          <router-view />
        </main>
      </div>
    </div>
    <div v-else class="h-screen">
      <router-view />
    </div>
  </div>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <Loading :loading="!appReady.appReady || loading.loading" screen />
</template>

<style>
.app {
  display: flex;
  height: 100vh;
}
.app-body {
  min-height: 0;
  flex: 1;
  display: flex;
}
.app-main {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
}
.app-panel {
  background: var(--bg-main);
  box-shadow: var(--shadow-soft);
  border-radius: 12px;
  padding: 24px;
}
</style>
