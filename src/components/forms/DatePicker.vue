<script setup lang="ts">
import { useId, computed } from 'vue';

import FloatLabel from 'primevue/floatlabel';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';

import { dateFormat } from '@/constants';

const props = defineProps<{
  modelValue?: Date | null,
  label: string,
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
  <FloatLabel variant="on">
    <DatePicker :id="id" v-model="model" :dateFormat :inputId="id" showIcon iconDisplay="input" v-bind="$attrs" />
    <label :for="id">{{props.label}}</label>
  </FloatLabel>
  <Message v-if="props.validation && props.invalid" severity="error" size="small" variant="simple">{{ props.errMsg }}</Message>
</template>
