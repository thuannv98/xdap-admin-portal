<script setup lang="ts">
import { useId, computed } from 'vue';

import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import AutoComplete from 'primevue/autocomplete';
import Message from 'primevue/message';
import Password from 'primevue/password';
import Divider from 'primevue/divider';

const props = defineProps<{
  modelValue?: string,
  label: string,
  validation?: boolean,
  invalid?: boolean,
  errMsg?: string,
  autocomplete?: boolean,
  help?: string,
  pt?: any,
  password?: boolean,
  passwordRules?: string[],
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
    <Password v-if="password" :id="id" v-model="model" toggleMask v-bind="$attrs" >
      <template v-if="passwordRules?.length" #footer>
        <Divider />
        <ul class="pl-2 my-0 leading-normal text-sm">
          <li v-for="rule in passwordRules" :key="rule">{{ rule }}</li>
        </ul>
      </template>
    </Password>
    <AutoComplete v-else-if="props.autocomplete" :id="id" v-model="model" v-bind="$attrs" />
    <InputText v-else :id="id" v-model="model" v-bind="$attrs" />
    <label :for="id">{{props.label}}</label>
  </FloatLabel>
  <Message v-if="props.validation && props.invalid || props.help" size="small" variant="simple"
    :severity="props.validation && props.invalid ? 'error' : 'secondary'"
    :class="pt?.message?.class || null">{{ props.validation && props.invalid ? props.errMsg : props.help }}</Message>
</template>
