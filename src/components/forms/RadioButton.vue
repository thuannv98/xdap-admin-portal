<script setup lang="ts">
import { defineProps, defineEmits, defineOptions, useId, computed } from 'vue';

import RadioButton from 'primevue/radiobutton';
import RadioButtonGroup from 'primevue/radiobuttongroup';
import Message from 'primevue/message';

import type { Option } from '@/constants';

const props = defineProps<{
  name?: string;
  options?: Option[],
  modelValue?: string,
  label?: string,
  validation?: boolean,
  invalid?: boolean,
  errMsg?: string,
}>();
const emit = defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const id = useId();
</script>

<template>
  <RadioButtonGroup v-if="name" :name class="flex flex-wrap gap-4">
    <div v-for="option in options" :key="option.value" class="flex items-center gap-2">
      <RadioButton :inputId="option.value.toString()" :value="option.value" />
      <label :for="option.value.toString()">{{option.label}}</label>
    </div>
  </RadioButtonGroup>
  <div v-else class="flex items-center gap-2">
    <RadioButton :id="id" v-model="model" v-bind="$attrs" />
    <label :for="id">{{props.label}}</label>
  </div>
  <Message v-if="props.validation && props.invalid" severity="error" size="small" variant="simple">{{ props.errMsg }}</Message>
</template>
