<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Form } from '@primevue/forms';
import { useConfirm } from "primevue/useconfirm";
import Button from 'primevue/button';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import Divider from 'primevue/divider';

import Panel from '@/components/Panel.vue';
import Table from '@/components/Table.vue';
import Input from '@/components/forms/Input.vue';
import Select from '@/components/forms/Select.vue';
import MultiSelect from '@/components/forms/MultiSelect.vue';
import {
  squadServices, schoolYearServices, sectorsServices,
  leaderServices, leaderRolesServices, squadRolesServices,
squadLeaderServices
} from '@/services/apis.service';
import { useNotify } from "@/services/toast.service";
import { getRoleImg, getShortName } from '@/utils/common';
import type { TableCol, TableActions } from '@/constants';
import { DB_CODES, type SquadLeaderAssignment, TblColType } from '@/constants';
import { useLoadingStore } from "@/stores/app";
import { useAuthStore } from '@/stores/auth';

const loading = useLoadingStore();
const auth = useAuthStore();
const { notifySuccess, notifyError, notifyInfo } = useNotify();
const confirm = useConfirm();
const router = useRouter();
function openAssignment() {
  router.push({ path: '/chi-doan/phan-nhiem'});
}
const isEditor = computed(() => auth.hasRole('editors'));


// data
const schoolYears = ref<any[]>([]);
const activeYear = ref<number>();
const sectors = ref<any[]>([]);
const squads = ref<any[]>([]);
const columns = computed<TableCol[]>(() => [
  { field: 'name', header: 'Tên chi đoàn', editable: true, filterEnabled: true, useLink: true, basePath: '/chi-doan', },
  { field: 'sectorId', header: 'Ngành', filterEnabled: true,
    useTemplate: true, templateName: 'sectorRowTpl',
    type: TblColType.Select, selectCfg: { options: sectors.value, optionTemplateName: 'sectorTpl' }
  },
  { field: 'president', header: 'Chi đoàn trưởng', filterEnabled: true },
  { field: 'vicePresidents', header: 'Chi đoàn phó', filterEnabled: true },
  { field: 'updatedAt', header: 'Cập nhật lần cuối' },
]);
const colFilters = ref({
  name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  sectorId: { value: null, matchMode: FilterMatchMode.IN },
  president: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  vicePresidents: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});
const actions = computed<TableActions[]>(() => isEditor.value ? [
  {
    icon: 'pi pi-trash',
    tooltip: 'Xóa',
    action: (squad: any, index: number) => {
      const {id, name} = squad;
      showConfirm(`Xoá chi đoàn ${name || ''}`.trim() + '?',
        deleteSquad.bind(null, id, () => squads.value.splice(index, 1)));
    }
  }
] : []);
const roleIds = ref<{president: number, vice: number}>();
const sectorImgs = ref(['chien', 'au', 'thieu', 'nghia', 'hiep']);
const sYearTbl = ref();
watch(activeYear, (newVal) => {
  sYearTbl.value = newVal;
  form.value?.setFieldValue('schoolYear', newVal);
  assignmentYearId.value = newVal;
});
// const leaders = computed(getAvailableLeaders);

// forms
const form = ref();
const assignmentForm = ref();
const initialValues = ref({
  name: '',
  schoolYear: '',
  sector: '',
});
const resolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Vui lòng nhập tên.' }),
    schoolYear: z.union([
      z.string().min(1, 'Vui lòng chọn năm học.'),
      z.number().min(1, 'Vui lòng chọn năm học.')
    ]),
    sector: z.union([
      z.string().min(1, 'Vui lòng chọn ngành.'),
      z.number().min(1, 'Vui lòng chọn ngành.')
    ]),
  })
));
const assignmentYearId = ref<number>();
const assignmentOptions = ref<any>({
  squads: [],
  pLeaders: [],
  vLeaders: []
});
const assignmentInitialValues = ref({
  squad: null,
  president: null,
  vices: []
});
const assignmentResolver = ref(zodResolver(
  z.object({
    squad: z.union([
      z.string().min(1, 'Vui lòng chọn chi đoàn.'),
      z.number().min(1, 'Vui lòng chọn chi đoàn.')
    ]),
    president: z.number().nullable().optional(),
    vice: z.array(z.number()).optional(),
  })
));
const allAssignments = ref<SquadLeaderAssignment[]>([]);
const currentAssignments = ref<SquadLeaderAssignment[]>([]);

const isCollapsed = ref(true);
const tblLoading = ref(false);
const schoolYearsLoading = ref(false);
const sectorsLoading = ref(false);
const squadsLoading = ref(false);
const leadersLoading = ref(false);


function detectSector(sectorInputValue: any) {
  const sector = sectors.value.find(s => normalize(sectorInputValue).includes(s.code));
  form.value?.setFieldValue('sector', sector ? sector.id : '');
}

async function onFormSubmit({ valid, values }: { valid: boolean, values: any }) {
  if (valid) {
    const existedSquad = squads.value.find(s => s.schoolYearId == values.schoolYear && normalize(s.name) == normalize(values.name));
    if (existedSquad) {
      const year = schoolYears.value.find(s => s.id == existedSquad.schoolYearId)?.name || '';
      notifyError(`Chi đoàn ${values.name} của năm học ${year} đã tồn tại. Không thể tạo thêm.`);
      return;
    }
    const squadData = {
      name: values.name,
      school_year_id: values.schoolYear,
      sector_id: values.sector
    }
    const isSchoolYearActive = schoolYears.value.find(s => s.id == values.schoolYear)?.is_active;
    if (isSchoolYearActive === false) {
      const cb = createSquad.bind(null, squadData);
      return showConfirm('Bạn đang thêm chi đoàn mới cho một năm học cũ hoặc chưa bắt đầu. Xác nhận thêm?', cb);
    }
    await createSquad(squadData);
  }
};

async function onFormSubmitAssignment({ valid, values }: { valid: boolean, values: any }) {
  if (valid) {
    const isSchoolYearActive = schoolYears.value.find(s => s.id == assignmentYearId.value)?.is_active;
    if (isSchoolYearActive === false) {
      const cb = updateAssignments.bind(null, values.squad, values.president, values.vice);
      return showConfirm('Bạn đang sửa phân nhiệm cho một năm học cũ hoặc chưa bắt đầu. Xác nhận?', cb);
    }
    await updateAssignments(values.squad, values.president, values.vice);
  }
}

async function updateAssignments(squad: number, presidentIndex: number, vicesIndex: number[]) {
  loading.setLoading(true);
  const initialAssignments = [...currentAssignments.value];
  const newSquadAssignments = [];
  const addedAssignments = [];
  if (roleIds.value && typeof presidentIndex === 'number') {
    const leaderId = assignmentOptions.value.pLeaders[presidentIndex].id;
    const existingAssignmentIndex = initialAssignments.findIndex(ass => ass.leader_id === leaderId && ass.role === roleIds.value?.president);
    if (existingAssignmentIndex > -1) {
      newSquadAssignments.push(...initialAssignments.splice(existingAssignmentIndex, 1));
    } else {
      addedAssignments.push({
        squad_id: squad,
        leader_id: assignmentOptions.value.pLeaders[presidentIndex].id,
        role: roleIds.value.president
      });
    }
  }
  if (roleIds.value && vicesIndex?.length > 0) {
    const vices = assignmentOptions.value.vLeaders
      .filter((_: any, i: number) => vicesIndex.includes(i))
      .map((l: any) => {
        const existingAssignmentIndex = initialAssignments.findIndex(ass => ass.leader_id === l.id && ass.role === roleIds.value?.vice);
        if (existingAssignmentIndex > -1) {
          newSquadAssignments.push(...initialAssignments.splice(existingAssignmentIndex, 1));
          return undefined;
        } else {
          return {
            squad_id: squad,
            leader_id: l.id,
            role: roleIds.value?.vice
          };
        }
      });
    addedAssignments.push(...vices.filter((ass: SquadLeaderAssignment) => ass));
    newSquadAssignments.push(...addedAssignments);
  }
  const minLen = Math.min(addedAssignments.length, initialAssignments.length);
  const updatedAssignments = [];
  for (let i = 0; i < minLen; i++) {
    updatedAssignments.push({ old: initialAssignments[i] as any, new: addedAssignments[i] });
  }
  const newAssignments = addedAssignments.slice(minLen);
  const oldAssignments = initialAssignments.slice(minLen);
  try {
    const apis = [
      ...oldAssignments.map(ass => squadServices.unassignLeader(ass)),
      ...updatedAssignments.map(ass => squadServices.updateAssignment(ass.old, ass.new)),
      ...newAssignments.map(ass => squadServices.assignLeader(ass)),
    ];
    await Promise.all(apis);
    if (apis.length) {
      currentAssignments.value = newSquadAssignments;
      notifySuccess('Đã lưu phân nhiệm');
    } else {
      notifyInfo('Phân nhiệm không có thay đổi');
    }
    loading.setLoading(false);
  } catch (error) {
    notifyError('Lỗi phân nhiệm: ' + error);
    loading.setLoading(false);
  }
}

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

const getSelectedSector = (sectorId: number) => (sectors.value || []).find((s: any) => s.id == sectorId);

const normalize = (str: string) => str.normalize("NFD") // separate accents
  .replace(/[\u0300-\u036f]/g, "")  // remove accents
  .replace(/\s+/g, "").toLowerCase();

function getSectorImg(sectorCode: string) {
  const sector = sectorImgs.value.find(sector => normalize(sector).includes(sectorCode));
  return sector ? new URL(`../assets/imgs/${sector}.png`, import.meta.url).href : null;
};

async function createSquad(squadData: any) {
  loading.setLoading(true);
  await squadServices.createSquad(squadData);
  loading.setLoading(false);
  notifySuccess('Chi đoàn mới đã được tạo.');
  await getSquads(sYearTbl.value);
}

async function getSquads(yearId: number) {
  try {
    tblLoading.value = true;
    const data = await squadServices.getSquads({include: 'leaders', school_year_id: yearId});
    squads.value = data.map((squad: any) => ({
      id: squad.id,
      name: squad.name,
      schoolYearId: squad.school_year_id,
      sectorId: squad.sector_id,
      // sectorName: squad.sector_name,
      sectorImg: getSectorImg(squad.sector_sname),
      president: squad.squad_president && getShortName(squad.squad_president.first_name, squad.squad_president.last_name),
      vicePresidents: (squad.vice_squad_presidents || []).map((v: any) => getShortName(v.first_name, v.last_name)).join(' / '),
      updatedAt: new Date(squad.updated_at).toLocaleString('vi-VN'),
    }));
    tblLoading.value = false;
  } catch (err) {
    notifyError('Tải dữ liệu không thành công: ' + err)
    tblLoading.value = false;
  }
}

async function deleteSquad(squadId: number, cb?: () => void) {
  try {
    loading.setLoading(true);
    await squadServices.deleteSquad(squadId);
    notifySuccess('Chi đoàn đã được xoá.');
    loading.setLoading(false);
    typeof cb == 'function' && cb();
  } catch (err) {
    notifyError('Xoá chi đoàn không thành công: ' + err);
    loading.setLoading(false);
  }
}

async function onRowEditSave({ newData, index }: { newData: any, index: number }) {
  try {
    if (JSON.stringify(newData) == JSON.stringify(squads.value[index])) {
      return;
    }
    const id = newData.id, data = {
      name: newData.name,
      sector_id: newData.sectorId
    };
    loading.setLoading(true);
    await squadServices.updateSquad(id, data);
    notifySuccess('Cập nhật thành công!');
    squads.value[index] = newData;
    loading.setLoading(false);
  } catch (err) {
    notifyError('Cập nhật không thành công: ' + err);
    loading.setLoading(false);
  }
}

async function getSchoolYears() {
  try {
    schoolYearsLoading.value = true;
    const data = await schoolYearServices.getSchoolYears();
    const active = data.find((s: any) => s.is_active)?.id;
    schoolYears.value = data;
    activeYear.value = active;
    schoolYearsLoading.value = false;
  } catch (err) {
    schoolYearsLoading.value = false;
  }
}

async function getSectors() {
  try {
    sectorsLoading.value = true;
    const data = await sectorsServices.getSectors();
    sectors.value = data.map((sector: any) => ({
      id: sector.id,
      name: sector.name,
      shortName: sector.code,
      sectorImg: getSectorImg(sector.code),
    }));
    sectorsLoading.value = false;
  } catch (err) {
    sectorsLoading.value = false;
  }
}

async function getLeaders() {
  try {
    leadersLoading.value = true;
    const [leaders, roles] = await Promise.all([leaderServices.getLeaders(), leaderRolesServices.getLeaderRoles()]);
    assignmentOptions.value.pLeaders = [];
    assignmentOptions.value.vLeaders = [];
    leaders.data.forEach((leader: any, index: number) => {
      const role = roles.find((r: any) => r.id == leader.role_id);
      const option = {
        index,
        id: leader.id,
        name: getShortName(leader.first_name, leader.last_name),
        // roleId: role?.id,
        roleImg: getRoleImg(roles, role?.name),
      };
      assignmentOptions.value.pLeaders.push({...option});
      assignmentOptions.value.vLeaders.push({...option});
    });
    leadersLoading.value = false;
  } catch (err) {
    leadersLoading.value = false;
    notifyError('Tải dữ liệu không thành công: ' + err)
  }
}

async function getSquadRoles() {
  try {
    const data = await squadRolesServices.getSquadRoles();
    roleIds.value = {
      president: data.find((r: any) => r.code === DB_CODES.SQUAD_PRESIDENT)?.id,
      vice: data.find((r: any) => r.code === DB_CODES.SQUAD_VICE)?.id,
    };
  } catch (error) {
    notifyError('Tải dữ liệu không thành công: ' + error)
  }
}

async function getLeaderAssignment(yearId: number) {
  if (typeof yearId == 'number') {
    allAssignments.value = [];
    try {
      squadsLoading.value = true;
      const data = await squadLeaderServices.getAssignment({school_year_id: yearId});
      allAssignments.value = data;
      const busyLeaders: number[] = [];
      data.forEach((leader: any) => {
        if (leader.squad_president) {
          const leaderIndex = assignmentOptions.value.pLeaders.findIndex((l: any) => l.id === leader.squad_president.id);
          busyLeaders.push(leaderIndex);
        }
        if (leader.vice_squad_presidents) {
          const leadersIndex = leader.vice_squad_presidents.map((vice: any) =>
            assignmentOptions.value.vLeaders.findIndex((l: any) => l.id === vice.id));
          busyLeaders.push(...leadersIndex);
        }
      });
      squadsLoading.value = false;
    } catch (error) {
      notifyError('Tải dữ liệu không thành công: ' + error);
      allAssignments.value = [];
      squadsLoading.value = false;
    }
  } else {
    allAssignments.value = [];
  }
}

async function onFormPanelToggle() {
  if (!isCollapsed.value) {
    const apis = []
    if (!roleIds.value) {
      apis.push(getSquadRoles());
    }
    if (!allAssignments.value.length && typeof assignmentYearId.value === 'number') {
      apis.push(getLeaderAssignment(assignmentYearId.value));
    }
    if (assignmentOptions.value.pLeaders.length === 0 || assignmentOptions.value.vLeaders.length === 0) {
      apis.push(getLeaders());
    }
    loading.setLoading(true);
    await Promise.all(apis);
    loading.setLoading(false);
  }
}

function squadChanged({value: squadId}: {value: number}) {
  assignmentForm.value?.setFieldValue('president', null);
  assignmentForm.value?.setFieldValue('vice', []);
  currentAssignments.value = [];
  leadersLoading.value = true;

  const vicesIndex: number[] = [];
  allAssignments.value.forEach((assignment: any) => {
    if (assignment.squad_id === squadId) {
      if (assignment.role === roleIds.value?.president) {
        const index = assignmentOptions.value.pLeaders.find((l: any) => l.id === assignment.leader_id)?.index;
        if (typeof index === 'number') {
          assignmentForm.value?.setFieldValue('president', index);
        }
      } else {
        vicesIndex.push(assignmentOptions.value.vLeaders.findIndex((l: any) => l.id === assignment.leader_id));
      }
      currentAssignments.value.push(assignment);
    }
  })
  assignmentForm.value?.setFieldValue('vice', vicesIndex);
  leadersLoading.value = false;
}

function presidentChanged(value: number) {
  assignmentOptions.value.vLeaders.forEach((option: any) => {
    option.disabled = option.index == value;
  });
}

function viceChanged(value: number[]) {
  const president = assignmentForm.value.states.president?.value;
  assignmentOptions.value.vLeaders.forEach((option: any) => {
    if (value.length == 2) {
      option.disabled = !value.includes(option.index);
    } else {
      option.disabled = president != '' && option.index == president;
    }
  });
  assignmentOptions.value.pLeaders.forEach((option: any) => {
    option.disabled = value.includes(option.index);
  });
}

onMounted(async () => {
  await Promise.all([
    getSectors(),
    getSchoolYears().then(() => {
      if (typeof activeYear.value === 'number') {
        return getSquads(activeYear.value)
      }
    })
  ]);
});

</script>

<template>
  <Panel v-if="isEditor" title="Thêm chi đoàn mới" toggleable @toggle="onFormPanelToggle" v-model:collapsed="isCollapsed"
    :pt="{
      title: {class: {'w-1/2': !isCollapsed, 'w-auto': isCollapsed}},
    }">
    <template #togglebutton>
      <Button severity="secondary" label="Xoá" />
    </template>
    <template #header>
      <div class="flex w-full gap-5 items-center">
        <span class="font-bold transition-all flex items-center gap-5" :style="{
          flexGrow: isCollapsed ? 0 : 1,
          transitionDuration: isCollapsed ? '500ms' : '1000ms'
        }">Thêm chi đoàn mới
          <span class="hidden xl:inline-block transition-all duration-1000" :class="{'opacity-0 scale-90': !isCollapsed}">
            <i class="pi pi-circle-fill"></i>
          </span>
        </span>
        <span class="font-bold transition-all hidden xl:flex gap-5 items-center" :class="[{'w-1/2': !isCollapsed, 'w-[13rem]': isCollapsed}]"
          :style="{transitionDuration: isCollapsed ? '500ms' : '1000ms'}">Phân nhiệm
          <Button icon="pi pi-window-maximize" rounded variant="outlined" @click="openAssignment()"
            aria-label="Chế độ kéo" v-tooltip="'Chế độ kéo'" size="small"
            :class="['!hidden', {'xl:!inline-block': !isCollapsed}]" />
        </span>
      </div>
    </template>
    <div class="w-full flex flex-col sm:flex-row sm:flex-wrap">
      <Form ref="form" v-slot="$form" :resolver :initialValues @submit="onFormSubmit"
        class="w-full flex flex-row flex-wrap xl:w-1/2 xl:pr-[3rem] self-start">
        <div class="p-[5px] w-1/2 rounded-xl lg:w-1/3 xl:w-1/2">
          <Select name="schoolYear" :options="schoolYears" label="Năm học" class="w-full md:w-56" :loading="schoolYearsLoading"
            :validation=true :invalid="$form.schoolYear?.invalid" :errMsg="$form.schoolYear?.error?.message"></Select>
        </div>
        <div class="p-[5px] w-1/2 rounded-xl lg:w-1/3 xl:w-1/2">
          <Select name="sector" :options="sectors" label="Ngành" class="w-full md:w-56" :loading="sectorsLoading"
            :validation=true :invalid="$form.sector?.invalid" :errMsg="$form.sector?.error?.message">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <img :alt="slotProps.value.label" :src="getSelectedSector(slotProps.value)?.sectorImg"
                  :class="`mr-2`" style="width: 18px" />
                <div>{{ getSelectedSector(slotProps.value)?.name }}</div>
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
        <div class="p-[5px] w-full rounded-xl sm:w-1/2 lg:w-1/3 xl:w-1/2">
          <Input name="name" type="text" label="Tên chi đoàn" fluid @update:modelValue="detectSector"
            :validation=true :invalid="$form.name?.invalid" :errMsg="$form.name?.error?.message" />
        </div>
        <div class="p-[5px] w-full sm:w-1/2 lg:w-full flex justify-end gap-2 items-center">
          <Button @click="$form.reset()" severity="secondary" label="Xoá" variant="outlined" />
          <Button :disabled="!$form.valid" type="submit" severity="primary" label="Thêm" variant="outlined" />
        </div>
      </Form>

      <Divider layout="vertical" class="!hidden xl:!flex" :pt="{root: {style: 'margin: 0 0 0 -2rem'}}">
        <i class="pi pi-spin pi-cog "></i>
      </Divider>
      <Divider layout="horizontal" class="!flex xl:!hidden" :pt="{content: {class: 'h-[1rem]'}}">
        <i class="pi pi-spin pi-cog "></i>
      </Divider>
      
      <div class="xl:hidden w-full pb-[0.875rem] flex justify-between items-center">
        <span class="panel-title font-bold">Phân nhiệm</span>
        <Button icon="pi pi-window-maximize" rounded variant="outlined" label="Chế độ kéo" @click="openAssignment()" size="small" />
      </div>

      <Form ref="assignmentForm" v-slot="$form" :initialValues="assignmentInitialValues" :resolver="assignmentResolver"
        @submit="onFormSubmitAssignment"
        class="w-full sm:flex-row sm:flex-wrap xl:w-1/2 xl:pl-[0.5rem] xl:ml-[0.5rem]">

        <div class="w-full flex justify-between items-center">
          <div class="w-full flex flex-row">
            <div class="p-[5px] rounded-xl w-1/2 lg:w-1/3 xl:w-1/2">
              <Select v-model="assignmentYearId" :options="schoolYears" label="Năm học" :loading="schoolYearsLoading"
                @change="getLeaderAssignment"></Select>
            </div>
            <div class="p-[5px] rounded-xl w-1/2 lg:w-1/3 xl:w-1/2">
              <Select name="squad" :options="squads" label="Chi đoàn" :loading="squadsLoading"
                :validation=true :invalid="$form.squad?.invalid" :errMsg="$form.squad?.error?.message"
                :disabled="schoolYearsLoading" @change="squadChanged"></Select>
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:flex-wrap">
          <div class="p-[5px] rounded-xl sm:w-1/2 lg:w-1/3 xl:w-1/2">
            <Select name="president" :options="assignmentOptions.pLeaders" label="Chi đoàn trưởng" :loading="leadersLoading"
              optionDisabled="disabled" optionLabel="name" optionValue="index" :disabled="$form.squad?.invalid || !$form.squad?.value"
              showClear @value-change="presidentChanged" ></Select>
          </div>
          <div class="p-[5px] rounded-xl sm:w-1/2 lg:w-1/3 xl:w-1/2">
            <MultiSelect name="vice" :options="assignmentOptions.vLeaders" label="Chi đoàn phó" :loading="leadersLoading"
              optionDisabled="disabled" optionLabel="name" optionValue="index" :disabled="$form.squad?.invalid || !$form.squad?.value"
              :showToggleAll="false"
              @value-change="viceChanged"></MultiSelect>
          </div>
          <div class="p-[5px] rounded-xl sm:w-full lg:w-1/3 xl:w-full flex justify-end gap-2 items-center">
            <Button @click="$form.reset()" severity="secondary" label="Xoá" variant="outlined" />
            <Button :disabled="!$form.valid" type="submit" severity="primary" label="Lưu" variant="outlined" />
          </div>
        </div>
      </Form>
    </div>
  </Panel>
  <Panel title="Danh sách chi đoàn">
    <Table :cols="columns" :data="squads" :actions="actions" :editable=isEditor
      :colFilters :loading="tblLoading" :colToggleable="true"
      @rowEditSave="onRowEditSave" @refresh="getSquads(sYearTbl)">
      <template #headerTools>
          <div class="col-span-1 md:w-45 lg:w-60">
            <Select v-model="sYearTbl" :options="schoolYears" label="Năm học" :loading="schoolYearsLoading" @change="getSquads(sYearTbl)" />
          </div>
      </template>
      <template #sectorRowTpl="{ value, row }">
        <div class="flex items-center gap-2">
          <img :alt="value" :src="row.sectorImg" class="w-5 rounded" />
          <div>{{ value }}</div>
        </div>
      </template>
      <template #sectorTpl="{ option }: any">
        <div class="flex items-center gap-2">
          <img :alt="option.name" :src="option.sectorImg" class="w-5 rounded" />
          <div>{{ option.name }}</div>
        </div>
      </template>
    </Table>
  </Panel>
</template>

<style scoped>
.panel-title {
  line-height: 1;
  font-weight: 600;
}
</style>