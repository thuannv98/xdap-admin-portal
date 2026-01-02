<script lang="ts" setup>
import { ref } from 'vue';

import OrganizationChart, { type OrganizationChartNode } from 'primevue/organizationchart';
import Divider from 'primevue/divider';

const props = defineProps<{
  data: OrganizationChartNode,
  emptyLabel?: string
}>();
const emit = defineEmits(['rowEditSave', 'delete', 'refresh', 'filter']);

const selection = ref<any>(null);
const memberDetails = ref<any>(null);

function showMemberDetails(node: OrganizationChartNode) {
  memberDetails.value = node.data;
}
</script>

<template>
  <div v-if="Object.keys(data).length" class="overflow-x-auto flex flex-row">
    <div class="w-full md:w-2/3">
      <OrganizationChart v-model:selectionKeys="selection" :value="data" collapsible selectionMode="single"
        @node-select="showMemberDetails" @node-unselect="memberDetails=null">
        <template #person="slotProps">
          <div class="flex flex-col">
            <div class="flex flex-col items-center">
              <img :alt="slotProps.node.data.name" :src="slotProps.node.data.image" class="mb-4 w-12 h-12" />
              <span class="font-bold mb-2">{{ slotProps.node.data.name }}</span>
              <span>{{ slotProps.node.data.title }}</span>
            </div>
          </div>
        </template>
      </OrganizationChart>
    </div>
    <div v-if="memberDetails" class="hidden md:flex md:w-1/3">
      <Divider layout="vertical" :pt="{root: {style: 'margin-left: -1rem; padding-right: 1rem'}}"></Divider>
      <div class="details">
        <div class="text-[0.95rem] font-semibold mb-4">Chi tiết phân nhiệm</div>
        <div class="text-sm text-gray-600 mb-2">Tên Thánh & Họ tên: <span class="font-semibold">{{memberDetails.name}}</span></div>
        <div class="text-sm text-gray-600 mb-2">Số điện thoại: <span class="font-semibold">{{memberDetails.phone}}</span></div>
        <div class="text-sm text-gray-600 mb-2">Cấp hiệu: <span class="font-semibold">{{memberDetails.role.longName}}</span></div>
        <div class="text-sm text-gray-600 mb-2">Chức vụ: <span class="font-semibold">{{memberDetails.title}}</span></div>
      </div>
    </div>
  </div>
  <div v-else class="placeholder">{{ emptyLabel }}</div>
</template>

<style scoped>
</style>