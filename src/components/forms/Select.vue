<script setup lang="ts">
import { useId, computed, ref } from 'vue';

import FloatLabel from 'primevue/floatlabel';
import Select from 'primevue/select';
import Message from 'primevue/message';

const props = defineProps<{
  modelValue?: string  | number | object,
  label?: string,
  validation?: boolean,
  invalid?: boolean,
  errMsg?: string,
  optionLabel?: any,
  optionValue?: any,
  loading?: boolean,
}>();
const emit = defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const id = useId();
const defaultOptionProps = ref({
  label: 'name',
  value: 'id'
});
</script>

<template>
  <FloatLabel class="w-full" variant="on">
    <Select :inputId="id" v-model="model" variant="filled" filter fluid 
      :optionLabel="props.optionLabel ?? defaultOptionProps.label"
      :optionValue="props.optionValue === null ? null : props.optionValue ?? defaultOptionProps.value"
      v-bind="{...$attrs, ...(props.loading ? { loading: true } : {})}" >
      
      <template #value="slotProps">
        <slot name="value" v-bind="slotProps" />
      </template>

      <template #option="slotProps">
        <slot name="option" v-bind="slotProps" />
      </template>

    </Select>
    <label :for="id">{{props.label}}</label>
  </FloatLabel>
  <Message v-if="props.validation && props.invalid" severity="error" size="small" variant="simple">{{ props.errMsg }}</Message>
</template>
