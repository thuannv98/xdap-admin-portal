<script lang="ts" setup>
import { ref, computed } from 'vue';

import { email, z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Form } from '@primevue/forms';
import { useConfirm } from "primevue/useconfirm";
import Button from 'primevue/button';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';


import Panel from '@/components/Panel.vue';
import Table from '@/components/Table.vue';
import Input from '@/components/forms/Input.vue';
import Select from '@/components/forms/Select.vue';
import DatePicker from '@/components/forms/DatePicker.vue';
import RadioButton from '@/components/forms/RadioButton.vue';
import { memberServices, leaderRolesServices, saintServices } from '@/services/apis.service';
import { useNotify } from "@/services/toast.service";
import type { TableCol, TableActions, Option } from '@/constants';
import { TblColType } from '@/constants';
import { useLoadingStore } from "@/stores/app";
import { useAuthStore } from '@/stores/auth';

const loading = useLoadingStore();
const auth = useAuthStore();
const props = defineProps<{
  data: any[],
  loading?: boolean;
}>();
const emit = defineEmits(['rowEditSave', 'delete', 'refresh', 'filter']);
const isEditor = computed(() => auth.hasRole('editors'));

const { notifySuccess, notifyError } = useNotify();
const confirm = useConfirm();
// const router = useRouter();

// data
const leaderRoles = ref<any[]>([]);
const members = ref<any[]>([]);
const filteredMembers = ref<any[]>([]);

const cols = computed<TableCol[]>(() => [
  { field: 'baptismName', header: 'Tên thánh', editable: true, filterEnabled: true },
  { field: 'firstName', header: 'Họ tên đệm', editable: true, filterEnabled: true },
  { field: 'lastName', header: 'Tên', editable: true, filterEnabled: true },
  { field: 'dob', header: 'Ngày sinh', editable: true, filterEnabled: true, type: TblColType.Date },
  { field: 'firstCommunion', header: 'Rước lễ lần đầu', editable: true, filterEnabled: true, type: TblColType.Date },
  { field: 'confirmation', header: 'Thêm sức', editable: true, filterEnabled: true, type: TblColType.Date },
  { field: 'dad', header: 'Tên ba', editable: true, filterEnabled: true },
  { field: 'mom', header: 'Tên mẹ', editable: true, filterEnabled: true },
  { field: 'parentPhone', header: 'SĐT PH', editable: true, filterEnabled: true },
]);
const colFilters = ref({
  baptismName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  firstName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  lastName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  dob: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  firstCommunion: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  confirmation: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  dad: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  mom: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  parentPhone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});
const actions = computed<TableActions[]>(() => isEditor.value ? [
  {
    icon: 'pi pi-trash',
    tooltip: 'Xóa',
    action: (member: any, index: number) => {
      const {id, firstName, lastName} = member;
      showConfirm(`Xoá đoàn sinh ${firstName || ''} ${lastName || ''}`.trim() + '?',
        deleteMember.bind(null, id, () => members.value.splice(index, 1)));
    }
  },
  {
    icon: 'pi pi-sync',
    tooltip: 'Chuyển chi đoàn',
    action: (member: any, index: number) => {
      const {id, firstName} = member;
      // showConfirm(`Xoá đoàn sinh ${firstName || ''}`.trim() + '?',
      //   deleteMember.bind(null, id, () => members.value.splice(index, 1)));
    }
  }
] : []);

function showConfirm(message: string, onAccept: () => void | Promise<void>) {
  confirm.require({
    message,
    header: 'Xác nhận',
    icon: 'pi pi-exclamation-circle',
    rejectProps: {
      label: 'Huỷ',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận'
    },
    accept: () => typeof onAccept == 'function' && onAccept()
  });
};

async function deleteMember(memberId: number, cb?: () => void) {
  try {
    loading.setLoading(true);
    await memberServices.deleteMember(memberId);
    notifySuccess('Đã xoá đoàn sinh.');
    loading.setLoading(false);
    typeof cb == 'function' && cb();
  } catch (err) {
    notifyError('Xoá không thành công: ' + err);
    loading.setLoading(false);
  }
}

async function onRowEditSave({ newData, index, field }: { newData: any, index: number, field: string }) {
  try {
    if (JSON.stringify(newData) == JSON.stringify(filteredMembers.value[index])) {
      return;
    }
    const id = newData.id, data = {
      baptism_name: newData.baptismName,
      first_name: newData.firstName,
      last_name: newData.lastName,
      dob: newData.dob,
      phone: newData.phone,
      email: newData.email,
      role_id: newData.roleId,
    };
    loading.setLoading(true);
    await memberServices.updateMember(id, data);
    notifySuccess('Cập nhật thành công!');
    const originalIndex = props.data.findIndex(l => l.id == id);
    if (originalIndex >= 0) {
      props.data[originalIndex] = newData;
    }
    filteredMembers.value[index] = newData;
    loading.setLoading(false);
  } catch (err: any) {
    notifyError('Cập nhật không thành công: ' + err.response?.data?.error?.message || err.message);
    loading.setLoading(false);
  }
}

function onFilter(event: any) {
  filteredMembers.value = event.filteredValue;
}
function onRefresh() {
  emit('refresh');
}
</script>

<template>
  <Table name="Danh sách đoàn sinh" :cols :data :actions :editable=isEditor :colFilters :loading="props.loading"
    colToggleable @filter="onFilter" @rowEditSave="onRowEditSave" @refresh="onRefresh">
  </Table>
</template>

<style scoped>
</style>