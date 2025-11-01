<script lang="ts" setup>
import { defineProps } from 'vue';

import Avatar from 'primevue/avatar';

const props = defineProps<{
  src?: string,
}>();
</script>

<template>
  <Avatar :image="props.src" :icon="props.src ? undefined : 'pi pi-user'" v-bind="$attrs" />
</template>