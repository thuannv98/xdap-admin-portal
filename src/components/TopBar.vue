<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import Popover from 'primevue/popover';
import Button from "primevue/button";
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import { useAuthStore } from '@/stores/auth';
import { getFirstLettersOfWords, getLeaderAvatar, getRole, processLeaderRole } from '@/utils/common';
import { useLeaderRolesStore } from '@/stores/apis';
import { useLoadingStore } from '@/stores/app';
import { authService } from '@/services/apis.service';
import { useNotify } from '@/services/toast.service';

const router = useRouter();
const loading = useLoadingStore();
const auth = useAuthStore();
const leaderRoles = useLeaderRolesStore();
const { notifyError } = useNotify();

const op = ref();
const filter = ref('');
const getUserRole = () => {
  const role = getRole(leaderRoles.roles, auth.user?.leader_details?.role_id, 'id');
  if (role) {
    return role.level ? processLeaderRole(getFirstLettersOfWords(role.name), role.level) : role.name;
  }
  return '';
}

const toggle = (event: any) => {
  op.value.toggle(event);
}

const logout = async () => {
  try {
    loading.setLoading(true);
    await authService.logout();
    loading.setLoading(false);
    auth.loggedOut();
    router.push({ name: 'login' });
  } catch (error) {
    notifyError('Có lỗi xảy ra. Vui lòng thử lại.');
    loading.setLoading(false);
  }
}
</script>

<template>
  <header class="p-1 top-bar">
    <div class="h-[3.8rem] flex justify-between items-center px-3">
      <div class="left flex">
        <Button class="sidebar-toggle md:!hidden" icon="pi pi-bars"
          severity="info" size="small" variant="text" rounded
          @click="$emit('sidebarOpen')" aria-label="Open sidebar" />
        <RouterLink to="/">
          <div class="h-[3.8rem] flex items-center gap-1">
            <img alt="logo" class="h-[3.8rem] max-w-none" src="@/assets/imgs/logo.png"/>
          </div>
        </RouterLink>
        <!-- <IconField class="w-full">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filter" placeholder="Tìm kiếm" class="w-full"/>
        </IconField> -->
      </div>
      <div class="tools flex gap-2">
        <OverlayBadge value="2" severity="secondary" class="notification">
          <Button icon="pi pi-bell" variant="text" rounded aria-label="Filter" size="large" />
        </OverlayBadge>
        <div class="account flex gap-2 items-center cursor-pointer" @click="toggle">
          <div class="info">
            <div class="account-name">{{ auth.user?.leader_details?.last_name || auth.user?.email }}</div>
            <div class="role text-xs text-[#6b7280]">{{ getUserRole() }}</div>
          </div>
          <Avatar :image="getLeaderAvatar(auth.user?.leader_details)" shape="circle" />
        </div>
        <Popover ref="op" :pt="{ content: { class: '!p-2' } }">
          <div class="flex flex-col">
              <Button icon="pi pi-sign-out" variant="text" label="Đăng xuất" @click="logout" />
          </div>
        </Popover>
      </div>
    </div>
    <div class="left">
      <!-- <img alt="logo" class="logo" src="@/assets/logo.png"/> -->
    </div>
  </header>
</template>

<style scoped>
  .top-bar {
  background: var(--bg-topbar);
  color: var(--text-dark);
  box-shadow: var(--shadow-soft);
  /* padding: 0 10px; */
  }
  .left {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .name {
    font-size: large;
    font-weight: bold;
    font-style: italic;
    color: #2563eb;
  }

  .notification ::v-deep .p-badge {
    top: 30%;
    right: 30%;
    outline-style: none;
    background: transparent;
  }
</style>
