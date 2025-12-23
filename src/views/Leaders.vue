<script lang="ts" setup>
import { onMounted, ref, computed, useSlots } from 'vue';

import { email, z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Form } from '@primevue/forms';
import { useConfirm } from "primevue/useconfirm";
import Button from 'primevue/button';
import FileUpload, { type FileUploadUploadEvent } from 'primevue/fileupload';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';


import Panel from '@/components/Panel.vue';
import Table from '@/components/Table.vue';
import Input from '@/components/forms/Input.vue';
import Select from '@/components/forms/Select.vue';
import DatePicker from '@/components/forms/DatePicker.vue';
import RadioButton from '@/components/forms/RadioButton.vue';
import { leaderServices, leaderRolesServices, saintServices, authService } from '@/services/apis.service';
import { useNotify } from "@/services/toast.service";
import { getRoleImg, normalize, processLeaderRole } from '@/utils/common';
import type { TableCol, TableActions, Option } from '@/constants';
import { TblColType } from '@/constants';
import { useLoadingStore } from "@/stores/app";
import { useAuthStore } from '@/stores/auth';
import Checkbox from 'primevue/checkbox';

const loading = useLoadingStore();
const auth = useAuthStore();
const { notifySuccess, notifyError } = useNotify();
const confirm = useConfirm();
// const router = useRouter();
const isEditor = computed(() => auth.hasRole('editors'));

// data
const leaderRoles = ref<any[]>([]);
const leaders = ref<any[]>([]);
const filteredLeaders = ref<any[]>([]);
const totalLeaders = ref(0);
const pagination = ref();

// forms
const form = ref();
const initialValues = ref({
  baptismName: '',
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  roleId: '',
  shouldCreateAccount: false,
});
const resolver = ref(zodResolver(
  z.object({
    baptismName: z.string().min(1, { message: 'Vui lòng nhập tên thánh.' }),
    firstName: z.string().min(1, { message: 'Vui lòng nhập họ tên đệm.' }),
    lastName: z.string().min(1, { message: 'Vui lòng nhập tên.' }),
    // dob: z.string().min(1, { message: 'Vui lòng chọn ngày sinh.' }).or(z.literal("")).optional().nullable(),
    dob: z.preprocess(
      (val: any) => val === '' || val === null ? null : new Date(val),
      z.date({ message: 'Vui lòng chọn ngày sinh.' }).or(z.literal("")).optional().nullable()
    ),
    gender: z.string().min(1, { message: 'Vui lòng chọn giới tính.' }),
    phone: z.string().regex(/^0\d{9}$/, { message: 'Số điện thoại không hợp lệ.' }).or(z.literal("")).optional().nullable(),
    email: z.string().email({ message: 'Email không hợp lệ.' }).or(z.literal("")).optional().nullable(),
    roleId: z.union([
      z.string().min(1, 'Vui lòng chọn cấp hiệu.'),
      z.number().min(1, 'Vui lòng chọn cấp hiệu.')
    ]),
    shouldCreateAccount: z.boolean('Giá trị không hợp lệ.')
  }).superRefine((data, ctx) => {
    if (data.shouldCreateAccount && !data.email) {
      ctx.addIssue({
        path: ['email'],
        message: 'Yêu cầu email khi tạo tài khoản',
        code: 'custom'
      })
    }
  })
));
const filePath = ref('');

// table
const columns = computed<TableCol[]>(() => [
  { field: 'baptismName', header: 'Tên thánh', editable: true, filterEnabled: true },
  { field: 'firstName', header: 'Họ tên đệm', editable: true, filterEnabled: true },
  { field: 'lastName', header: 'Tên', editable: true, filterEnabled: true },
  { field: 'dob', header: 'Ngày sinh', editable: true, filterEnabled: true, type: TblColType.Date },
  { field: 'phone', header: 'Số điện thoại', editable: true, filterEnabled: true },
  { field: 'email', header: 'Email', editable: true, filterEnabled: true },
  { field: 'roleId', header: 'Cấp hiệu', editable: true, filterEnabled: true,
    type: TblColType.Select, useTemplate: true, templateName: 'leaderRoleRowTpl',
    selectCfg: {
      options: leaderRoles.value,
      labelProp: 'longName',
      optionTemplateName: 'leaderRoleOptTpl',
      valueTemplateName: 'leaderRoleValueTpl',
    } },
]);
const colFilters = ref({
  baptismName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  firstName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  lastName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  dob: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  phone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  roleId: { value: null, matchMode: FilterMatchMode.IN },
});
const actions = computed<TableActions[]>(() => isEditor.value ? [
  {
    icon: 'pi pi-trash',
    tooltip: 'Xóa',
    action: (leader: any, index: number) => {
      const {id, firstName} = leader;
      showConfirm(`Xoá Trưởng ${firstName || ''}`.trim() + '?',
        deleteLeader.bind(null, id, () => leaders.value.splice(index, 1)));
    }
  }
] : []);
const genders = ref<Option[]>([
  {label: 'Nam', value: 'M'},
  {label: 'Nữ', value: 'F'},
]);
const saints = ref<any[]>([]);
const filteredSaints = ref<any[]>([]);
const tblLoading = ref(false);
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

async function addLeader(leaderData: any) {
  try {
    loading.setLoading(true);
    const newLeader = await leaderServices.addLeader(leaderData);
    notifySuccess('Đã thêm Trưởng mới.');
    await getLeaders();
    loading.setLoading(false);
    return newLeader;
  } catch (err) {
    notifyError('Thêm không thành công: ' + err);
    loading.setLoading(false);
    throw err;
  }
}

async function getLeaders() {
  try {
    tblLoading.value = true;
    const data = await Promise.all([leaderServices.getLeaders(pagination.value), getLeaderRoles()]);
    leaders.value = data[0].data.map((leader: any) => {
      const role = leaderRoles.value.find((r: any) => r.id == leader.role_id);
      return {
        id: leader.id,
        baptismName: leader.baptism_name,
        firstName: leader.first_name,
        lastName: leader.last_name,
        dob: leader.dob && new Date(leader.dob),
        phone: leader.phone,
        email: leader.email,
        roleId: role?.id,
        roleImg: getRoleImg(leaderRoles.value, role?.name),
      }
    });
    totalLeaders.value = data[0].pagination.total;
    filteredLeaders.value = leaders.value;
    tblLoading.value = false;
  } catch (err) {
    notifyError('Tải dữ liệu không thành công: ' + err)
    tblLoading.value = false;
  }
}

async function deleteLeader(leaderId: number, cb?: () => void) {
  try {
    loading.setLoading(true);
    await leaderServices.deleteLeader(leaderId);
    notifySuccess('Đã xoá Trưởng.');
    loading.setLoading(false);
    typeof cb == 'function' && cb();
  } catch (err) {
    notifyError('Xoá không thành công: ' + err);
    loading.setLoading(false);
  }
}

async function createUser(email: string, leaderId: string) {
  try {
    loading.setLoading(true);
    await authService.createUser({ email, leader_id: leaderId });
    notifySuccess('Đã tạo tài khoản. Xem chi tiết đăng nhập trong email.');
    loading.setLoading(false);
  } catch (err) {
    notifyError('Tạo tài khoản không thành công: ' + err);
    loading.setLoading(false);
    throw err;
  }
}

async function onRowEditSave({ newData, index, field }: { newData: any, index: number, field: string }) {
  try {
    if (JSON.stringify(newData) == JSON.stringify(filteredLeaders.value[index])) {
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
    await leaderServices.updateLeader(id, data);
    notifySuccess('Cập nhật thành công!');
    const originalIndex = leaders.value.findIndex(l => l.id == id);
    if (originalIndex >= 0) {
      leaders.value[originalIndex] = newData;
    }
    filteredLeaders.value[index] = newData;
    loading.setLoading(false);
  } catch (err: any) {
    notifyError('Cập nhật không thành công: ' + err.message);
    loading.setLoading(false);
  }
}

async function getLeaderRoles() {
  try {
    leaderRolesLoading.value = true;
    const data = await leaderRolesServices.getLeaderRoles();
    leaderRoles.value = data.map((r: any) => ({
      ...r,
      roleImg: getRoleImg(data, r.name),
    }));
    // leaderRoles.value[1].selected = true;/////////////////////////////////////////
    leaderRolesLoading.value = false;
  } catch (err) {
    notifyError('Tải dữ liệu không thành công: ' + err)
    leaderRolesLoading.value = false;
  }
}

function searchSaint({query}: {query: string}) {
  if (!query?.trim().length) {
    filteredSaints.value = [...saints.value];
  } else {
    filteredSaints.value = saints.value.filter((saint) => normalize(saint.name).includes(normalize(query)));
  }
}

function setBaptismName({value: saint}: {value: any}) {
  form.value?.setFieldValue('baptismName', saint.name);
}

async function getSaints() {
  const data = await saintServices.get();
  saints.value = data
}

async function onFormPanelToggles(event: any) {
  if (!event.value) {
    const apis = [];
    if (!event.value && !leaderRoles.value.length) {
      apis.push(getLeaderRoles());
    }
    if (!saints.value.length) {
      apis.push(getSaints());
    }
    await Promise.all(apis);
  }
}

function onFilter(event: any) {
  filteredLeaders.value = event.filteredValue;
}

async function onFormSubmit({ valid, values }: { valid: boolean, values: any }) {
  if (valid) {
    // try {
      const data = {
        baptism_name: values.baptismName,
        first_name: values.firstName,
        last_name: values.lastName,
        dob: values.dob,
        gender: values.gender,
        phone: values.phone,
        email: values.email,
        role_id: values.roleId,
        avatar: filePath.value || null
      };
      const newLeader = await addLeader(data);
      if (values.shouldCreateAccount) {
        await createUser(values.email, newLeader.id);
      }
      form.value?.reset();
    // } finally {

    // }
  }
};

async function paging(p: {page: number, limit: number}) {
  pagination.value = p;
  await getLeaders();
}


onMounted(async () => {
});

const onAdvancedUpload = ({ xhr: xmlHttpRequest }: FileUploadUploadEvent) => {
  try {
    const apiResponse = JSON.parse(xmlHttpRequest.response);
    filePath.value = apiResponse.path;
  } catch (error) {
    notifyError(`Failed to handle file upload: ${error}`);
  }

};
const s = ref({})
</script>

<template>
  <Panel v-if="isEditor" title="Thêm huynh trưởng" toggleable collapsed @toggle="onFormPanelToggles">
    <!-- <div class="flex flex-col w-full sm:flex-row sm:flex-wrap"> -->
    <Form ref="form" v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
      class="flex flex-col w-full sm:flex-row sm:flex-wrap">
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
      <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3 flex items-center gap-2">
        <Checkbox name="shouldCreateAccount" inputId="shouldCreateAccount"  binary />
        <label for="shouldCreateAccount">Tạo tài khoản đăng nhập</label>
      </div>
      <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
        <Select name="roleId" :options="leaderRoles" label="Cấp hiệu" class="w-full md:w-56"
          :loading="leaderRolesLoading" optionLabel="longName"
          :validation=true :invalid="$form.roleId?.invalid" :errMsg="$form.roleId?.error?.message">
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center">
              <img :alt="slotProps.value.label" :src="getSelectedRole(slotProps.value)?.roleImg"
                :class="`mr-2`" style="width: 18px" />
              <div>{{ getSelectedRole(slotProps.value)?.longName }}</div>
            </div>
            <div v-else style="height: 1.5rem;">
              {{ slotProps.placeholder }}
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center">
              <img :alt="slotProps.option.label" :src="slotProps.option.roleImg"
                :class="`mr-2`" style="width: 18px" />
              <div>{{ slotProps.option.longName }}</div>
            </div>
          </template>
        </Select>
      </div>
      <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
        <Input name="phone" type="text" label="Số điện thoại" fluid
          :validation=true :invalid="$form.phone?.invalid" :errMsg="$form.phone?.error?.message" />
      </div>
      <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
        <Input name="email" type="text" label="Email" fluid
          :validation=true :invalid="$form.email?.invalid" :errMsg="$form.email?.error?.message" />
      </div>
      <div class="basis-full h-0 hidden sm:block"></div>
      <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3">
        <FileUpload name="file" url="/api/v1/upload" @upload="onAdvancedUpload($event)" :multiple="false" :showCancelButton="false" accept="image/*" :maxFileSize="1000000">
            <template #empty>
                <span>Kéo thả ảnh vào đây để tải lên.</span>
            </template>
        </FileUpload>
      </div>
      <div class="p-[5px] w-full sm:w-1/2 lg:w-2/3 flex justify-end gap-2 items-center">
        <Button @click="$form.reset()" severity="secondary" label="Xoá" />
        <Button type="submit" severity="primary" label="Thêm" />
      </div>
    </Form>
    <!-- <div class="w-full xl:w-2/3" style="border: 1px solid violet;">
      <Button label="Chế độ kéo" @click="openAssignment()" />
    </div>
    </div> -->
  </Panel>
  <Panel>
    <Table name="Danh sách huynh trưởng" :cols="columns" :data="leaders" :actions="actions" :editable=isEditor
      :colFilters :loading="tblLoading" colToggleable @filter="onFilter"
      @rowEditSave="onRowEditSave" @refresh="getLeaders" :totalRows="totalLeaders" @paging="paging">
      <template #leaderRoleRowTpl="{ value, row }">
        <div class="flex items-center gap-2">
          <img :alt="value" :src="getRoleImg(leaderRoles, row.roleId, 'id')" class="w-5 rounded" />
          <div>{{ value }}</div>
        </div>
      </template>
      <template #leaderRoleOptTpl="{ option }: any">
        <div class="flex items-center gap-2">
          <img :alt="option.longName" :src="option.roleImg" class="w-5 rounded" />
          <div>{{ option.longName }}</div>
        </div>
      </template>
      <template #leaderRoleValueTpl="{ selected, value, placeholder }: any">
        <div v-if="value" class="flex items-center">
          <img :alt="value.label" :src="selected.roleImg"
            :class="`mr-2`" style="width: 18px" />
          <div>{{ selected?.longName }}</div>
        </div>
        <div v-else style="height: 1.5rem;">
          {{ placeholder }}
        </div>
        <!-- <div class="flex items-center gap-2">
          <img :alt="option.longName" :src="option.roleImg" class="w-5 rounded" />
          <div>{{ option.longName }}</div>
        </div> -->
      </template>
    </Table>
  </Panel>
</template>

<style scoped>
</style>