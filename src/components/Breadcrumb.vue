<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from 'vue-router';
import { computed } from 'vue';

import Breadcrumb from 'primevue/breadcrumb';

const route = useRoute();

const items = computed(() => {
  const meta = route.meta.breadcrumb;

  if (typeof meta === 'function') {
    return meta(route);
  }
  return meta || [];
});
</script>

<template>
  <Breadcrumb v-if="items.length" :model="items" :pt="{
    root: {class: '!bg-transparent !pb-0'}
  }">
    <template #item="{ item, props }">
      <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span :class="[item.icon, 'text-color']" />
          <span class="text-primary font-semibold">{{ item.label }}</span>
        </a>
      </router-link>
      <span v-else class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
    </template>
  </Breadcrumb>
</template>