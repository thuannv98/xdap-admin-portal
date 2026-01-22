<script lang="ts" setup>
import { onMounted, ref, computed, useSlots } from 'vue';

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
import { memberServices, leaderRolesServices, saintServices, squadServices } from '@/services/apis.service';
import { useNotify } from "@/services/toast.service";
import { useActiveSchoolYearStore } from '@/stores/apis';
import { getRoleImg, normalize, getSectorImg, preProcessDateInput, getFullName } from '@/utils/common';
import type { TableCol, TableActions, Option } from '@/constants';
import { TblColType } from '@/constants';
import { useLoadingStore } from "@/stores/app";
import { useAuthStore } from '@/stores/auth';

const loading = useLoadingStore();
const auth = useAuthStore();
const { notifySuccess, notifyError } = useNotify();
const confirm = useConfirm();
const activeYear = useActiveSchoolYearStore();
// const router = useRouter();
const isEditor = computed(() => auth.hasRole('editors'));

// data
const leaderRoles = ref<any[]>([]);
const members = ref<any[]>([]);
const totalMembers = ref(0);
const filteredMembers = ref<any[]>([]);
const tblLoading = ref(false);

// forms
const form = ref();
const initialValues = ref({
  baptismName: '',
  firstName: '',
  lastName: '',
  gender: '',
  dob: '',
  firstCommunion: '',
  confirmation: '',
  dad: '',
  mom: '',
  parentPhone: '',
  squad: '',
});
const resolver = ref(zodResolver(
  z.object({
    baptismName: z.string().min(1, { message: 'Vui lòng nhập tên thánh.' }),
    firstName: z.string().min(1, { message: 'Vui lòng nhập họ tên đệm.' }),
    lastName: z.string().min(1, { message: 'Vui lòng nhập tên.' }),
    // dob: z.string().min(1, { message: 'Vui lòng chọn ngày sinh.' }).or(z.literal("")).optional().nullable(),
    dob: z.preprocess(preProcessDateInput,
      z.date({ message: 'Ngày không hợp lệ.' }).nullable()
    ),
    gender: z.string().min(1, { message: 'Vui lòng chọn giới tính.' }),
    firstCommunion: z.preprocess(preProcessDateInput,
      z.date({ message: 'Ngày không hợp lệ.' }).or(z.literal("")).optional().nullable()
    ),
    confirmation: z.preprocess(preProcessDateInput,
      z.date({ message: 'Ngày không hợp lệ.' }).or(z.literal("")).optional().nullable()
    ),
    dad: z.string().nullable(),
    mom: z.string().nullable(),
    parentPhone: z.string().regex(/^0\d{9}$/, { message: 'Số điện thoại không hợp lệ.' }).or(z.literal("")).optional().nullable(),
    squad: z.number().nullable(),
  })
));
const genders = ref<Option[]>([
  {label: 'Nam', value: 'M'},
  {label: 'Nữ', value: 'F'},
]);
const saints = ref<any[]>([]);
const filteredSaints = ref<any[]>([]);
const squads = ref<any[]>([]);
const squadsLoading = ref(false);
const squadPagination = ref({page: 1, limit: 1000});

// table
const columns = computed<TableCol[]>(() => [
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
    action: async (member: any, index: number) => {
      const memSquads = await getMemberSquad(member.id);
      if (!memSquads) {
        return;
      }
      if (memSquads.length === 0) {
        return showConfirm(
          `Xoá đoàn sinh ${getFullName(member)}`.trim() + '?',
          deleteMember.bind(null, member.id, () => members.value.splice(index, 1))
        );
      }
      const squad = memSquads[0].squad_details || {};
      showConfirm(
        `Đoàn sinh ${getFullName(member)} đang sinh hoạt tại chi đoàn ${squad.name || ''}. Xác nhận xoá`.trim() + '?',
        async () => {
          await removeMemberFromSquad(member.id, squad.id);
          await deleteMember(member.id, () => members.value.splice(index, 1));
        }
      );
    }
  }
] : []);
const pagination = ref();
const leaderRolesLoading = ref(false);

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
const getSelectedRole = (roleId: number) => (leaderRoles.value || []).find((s: any) => s.id == roleId);

async function addMember(memberData: any) {
  const newMember = await memberServices.addMember(memberData);
  notifySuccess('Đã thêm đoàn sinh mới.');
  await getMembers();
  return newMember;
}

async function getMembers() {
  try {
    tblLoading.value = true;
    const data = await memberServices.getMembers(pagination.value);
    members.value = data.data.map((member: any) => {
      return {
        id: member.id,
        baptismName: member.baptism_name,
        firstName: member.first_name,
        lastName: member.last_name,
        dob: member.dob && new Date(member.dob),
        firstCommunion: member.first_communion && new Date(member.first_communion),
        confirmation: member.confirmation && new Date(member.confirmation),
        dad: member.dad,
        mom: member.mom,
        parentPhone: member.parent_phone,
      }
    });
    totalMembers.value = data.pagination.total;
    filteredMembers.value = members.value;
    tblLoading.value = false;
  } catch (err) {
    notifyError('Tải dữ liệu không thành công: ' + err)
    tblLoading.value = false;
  }
}

async function deleteMember(memberId: string, cb?: () => void) {
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

async function getMemberSquad(memberId: string) {
  // try {
    loading.setLoading(true);
    const memSquads = await memberServices.getMemberSquad(memberId, {
      school_year_id: activeYear.yearInstance.id,
      detailsBy: 'squad_id'
    });
    loading.setLoading(false);
    return memSquads;
  // } catch (err) {
  //   notifyError('Lỗi tìm nạp dữ liệu: ' + err);
  //   loading.setLoading(false);
  // }
}

async function removeMemberFromSquad(memberId: string, squadId: number) {
  try {
    loading.setLoading(true);
    await memberServices.removeMemberFromSquad(memberId, squadId);
    loading.setLoading(false);
  } catch (err) {
    notifyError('Xoá đoàn sinh khỏi chi đoàn không thành công: ' + err);
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
    const originalIndex = members.value.findIndex(m => m.id == id);
    if (originalIndex >= 0) {
      members.value[originalIndex] = newData;
    }
    filteredMembers.value[index] = newData;
    loading.setLoading(false);
  } catch (err: any) {
    notifyError('Cập nhật không thành công: ' + err.response?.data?.error?.message || err.message);
    loading.setLoading(false);
  }
}

async function getLeaderRoles() {
  try {
    leaderRolesLoading.value = true;
    const data = await leaderRolesServices.getLeaderRoles();
    leaderRoles.value = data.map((r: any) => ({
      ...r,
      roleImg: getRoleImg(leaderRoles.value, r.name),
    }));
    leaderRoles.value[1].selected = true;
    leaderRolesLoading.value = false;
  } catch (err) {
    notifyError('Tải dữ liệu không thành công: ' + err)
    leaderRolesLoading.value = false;
  }
}

async function getSaints() {
  const data = await saintServices.get();
  saints.value = data
  // .map(saint => saint.name);
}

async function getSquads() {
  squadsLoading.value = true;
  if (!activeYear.yearInstance) {
    await activeYear.fetch();
    if (!activeYear.yearInstance) {
      squadsLoading.value = false;
      return;
    }
  }
  const data = await squadServices.getSquads({school_year_id: activeYear.yearInstance.id, ...squadPagination.value});
  squads.value = data.data.map((squad: any) => ({
    id: squad.id,
    name: squad.name,
    sectorImg: getSectorImg(squad.sector_sname),
  }));
  squadsLoading.value = false;
}

const getSelectedSquad = (squadId: number) => (squads.value || []).find((s: any) => s.id == squadId);

function searchSaint({query}: {query: string}) {
  if (!query?.trim().length) {
    filteredSaints.value = [...saints.value];
  } else {
    filteredSaints.value = saints.value.filter((saint) => normalize(saint.name).includes(normalize(query)));
  }
}

async function onFormPanelToggles(event: any) {
  if (!event.value) {
    const apis = [];
    if (!leaderRoles.value.length) {
      apis.push(getLeaderRoles());
    }
    if (!saints.value.length) {
      apis.push(getSaints());
    }
    if (!squads.value.length) {
      apis.push(getSquads());
    }
    await Promise.all(apis);
  }
}

function onFilter(event: any) {
  filteredMembers.value = event.filteredValue;
}

function setBaptismName({value: saint}: {value: any}) {
  form.value?.setFieldValue('baptismName', saint.name);
}

async function onFormSubmit({ valid, values }: { valid: boolean, values: any }) {
  if (valid) {
    const data = {
      baptism_name: values.baptismName,
      first_name: values.firstName,
      last_name: values.lastName,
      dob: values.dob,
      gender: values.gender,
      first_communion: values.firstCommunion,
      confirmation: values.confirmation,
      dad: values.dad,
      mom: values.mom,
      parent_phone: values.parentPhone,
    }
    loading.setLoading(true);
    const newMember = await addMember(data);
    if (values.squad && newMember?.id) {
      await squadServices.addMember({
        squad_id: values.squad,
        member_id: newMember.id,
      });
    }
    loading.setLoading(false);
    form.value?.reset();
  }
};

async function paging(p: {page: number, limit: number}) {
  pagination.value = p;
  await getMembers();
}

onMounted(async () => {
  if (!activeYear.yearInstance) {
    await activeYear.fetch();
  }
});
</script>

<template>
  <Panel v-if="isEditor" title="Thêm đoàn sinh" toggleable collapsed @toggle="onFormPanelToggles">
    <Form ref="form" v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
      class="flex flex-col justify-between w-full sm:flex-row sm:flex-wrap">
      <div class="flex flex-col w-full sm:flex-row sm:flex-wrap">
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Input name="baptismName" type="text" label="Tên thánh" fluid
            autocomplete :suggestions="filteredSaints" optionLabel="name" :showEmptyMessage="false" @complete="searchSaint" @option-select="setBaptismName"
            :validation=true :invalid="$form.baptismName?.invalid" :errMsg="$form.baptismName?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Input name="firstName" type="text" label="Họ tên đệm" fluid
            :validation=true :invalid="$form.firstName?.invalid" :errMsg="$form.firstName?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Input name="lastName" type="text" label="Tên" fluid
            :validation=true :invalid="$form.lastName?.invalid" :errMsg="$form.lastName?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <DatePicker name="dob" label="Ngày sinh" fluid
            :validation=true :invalid="$form.dob?.invalid" :errMsg="$form.dob?.error?.message" />
        </div>
        <div class="px-[5px] py-[15px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <RadioButton name="gender" :options="genders"
            :validation=true :invalid="$form.gender?.invalid" :errMsg="$form.gender?.error?.message" />
        </div>
      </div>
      <div class="flex flex-col w-full sm:flex-row sm:flex-wrap">
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <DatePicker name="firstCommunion" label="Rước lễ lần đầu" fluid
            :validation=true :invalid="$form.firstCommunion?.invalid" :errMsg="$form.firstCommunion?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <DatePicker name="confirmation" label="Thêm sức" fluid
            :validation=true :invalid="$form.confirmation?.invalid" :errMsg="$form.confirmation?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Input name="dad" type="text" label="Tên Thánh & Họ tên ba" fluid
            :validation=true :invalid="$form.dad?.invalid" :errMsg="$form.dad?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Input name="mom" type="text" label="Tên Thánh & Họ tên mẹ" fluid
            :validation=true :invalid="$form.mom?.invalid" :errMsg="$form.mom?.error?.message" />
        </div>
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Input name="parentPhone" type="text" label="Số điện thoại ba mẹ" fluid
            :validation=true :invalid="$form.parentPhone?.invalid" :errMsg="$form.parentPhone?.error?.message" />
        </div>
      </div>
      <div class="w-full flex justify-between">
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
          <Select name="squad" :options="squads" label="Thuộc chi đoàn" class="w-full md:w-56" :loading="squadsLoading">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <img :alt="slotProps.value.label" :src="getSelectedSquad(slotProps.value)?.sectorImg"
                  :class="`mr-2`" style="width: 18px" />
                <div>{{ getSelectedSquad(slotProps.value)?.name }}</div>
              </div>
              <div v-else style="height: 1.5rem;">
                {{ slotProps.placeholder }}
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <img :alt="slotProps.option.label" :src="slotProps.option.sectorImg"
                  :class="`mr-2`" style="width: 18px" />
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
        </div>
        <div class="flex gap-2 items-center">
          <Button @click="$form.reset()" severity="secondary" label="Xoá" />
          <Button type="submit" severity="primary" label="Thêm" />
        </div>
      </div>
    </Form>
  </Panel>
  <Panel>
    <Table name="Danh sách đoàn sinh" :cols="columns" :data="members" :actions :editable=isEditor :colFilters :loading="tblLoading"
      colToggleable @filter="onFilter" @rowEditSave="onRowEditSave" @refresh="getMembers" :totalRows="totalMembers" @paging="paging">
      <template #leaderRoleRowTpl="{ value, row }">
        <div class="flex items-center gap-2">
          <img :alt="value" :src="getRoleImg(leaderRoles, row.roleId, 'id')" class="w-5 rounded" />
          <div>{{ value }}</div>
        </div>
      </template>
    </Table>
  </Panel>
</template>

<style scoped>
</style>