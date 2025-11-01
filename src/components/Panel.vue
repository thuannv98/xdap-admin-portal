<script setup lang="ts">
import Panel from 'primevue/panel';

const props = defineProps<{
  title?: string,
  toggleable?: boolean,
  collapsed?: boolean,
}>();
</script>

<template>
  <div class="panel">
    <Panel :toggleable :header="props.title" :collapsed v-bind="$attrs">
      <!-- <div v-if="props.title" class="text-base font-bold pb-4">{{ props.title }}</div> -->
      <template #header>
        <slot name="header" />
      </template>
      <template #icons>
        <slot name="icons" />
      </template>
      <slot />
    </Panel>
  </div>
</template>

<style scoped>
.panel {
  background-color: #ffffff;
  border-radius: 12px;
  margin: 10px;
  /* padding: 16px 20px; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  /* border: 1px solid #e5e7eb; */
}
.panel:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
</style>
