<script setup lang="ts">
import { defineProps, defineEmits, defineOptions, useId, computed } from 'vue';

import FloatLabel from 'primevue/floatlabel';
import MultiSelect from 'primevue/multiselect';
import Message from 'primevue/message';

const props = defineProps<{
  modelValue?: string,
  label: string,
  validation?: boolean,
  invalid?: boolean,
  errMsg?: string,
  optionLabel?: string,
  optionValue?: string,
  loading?: boolean,
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
  <FloatLabel class="w-full" variant="on">
    <MultiSelect :inputId="id" v-model="model" variant="filled" filter fluid 
      :optionLabel="props.optionLabel || 'name'" :optionValue="props.optionValue || 'id'"
      v-bind="{...$attrs, ...(props.loading ? { loading: true } : {})}" >
      
      <template #value="slotProps">
        <slot name="value" v-bind="slotProps" />
      </template>

      <template #option="slotProps">
        <slot name="option" v-bind="slotProps" />
      </template>

    </MultiSelect>
    <label :for="id">{{props.label}}</label>
  </FloatLabel>
  <Message v-if="props.validation && props.invalid" severity="error" size="small" variant="simple">{{ props.errMsg }}</Message>
</template>
