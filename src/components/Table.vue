<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Column from 'primevue/column';
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import DatePicker from 'primevue/datepicker';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import ProgressBar from 'primevue/progressbar';

import type { TableActions, TableCol } from '@/constants';
import { TblColType } from '@/constants';
import Paginator, { type PageState } from 'primevue/paginator';

const props = defineProps<{
  name?: string,
  data: any[],
  cols: TableCol[],
  actions: TableActions[],
  editable?: boolean,
  colToggleable?: boolean,
  colFilters?: any,
  loading?: boolean;
  globalFilterFields?: string[],
  totalRows?: number,
}>();
const emit = defineEmits(['rowEditSave', 'delete', 'refresh', 'filter', 'paging']);
const selectedCols = ref<string[]>(props.cols.map(col => col.field));
const enabledCols = computed(() => props.cols.filter(col => selectedCols.value.includes(col.field) ));

const editingRows = ref([]);
const onRowEditSave = (event: any) => {
  emit('rowEditSave', event);
};
const onFilter = (event: any) => {
  emit('filter', event);
}
const globalFilterFields = computed(() => {
  if (props.globalFilterFields) {
    return props.globalFilterFields;
  }
  return props.cols.map(c => c.field);
})
const filters = ref<any>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ...props.colFilters,
  representative: { value: null, matchMode: FilterMatchMode.IN },
});
const pt = ref({
  table: { style: 'min-width: 50rem' },
  header: { class: '!px-0 !pt-0' },
  column: {
    bodycell: ({ state }: any) => ({
      style: state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem',
      class: !state['d_editing']&&'body-cell'
    })
  }
});
const defaultRowsPerPage = ref(10);

const getCellValue = (data: any, col: TableCol) => {
  if (col.type == TblColType.Select  && col.selectCfg) {
    const selectedItem = getSelectedCellOption(data[col.field], col.selectCfg);
    return selectedItem ? selectedItem[col.selectCfg?.labelProp || 'name'] : '';
  }
  if (col.type == TblColType.Date) {
    return data[col.field]?.toLocaleDateString()
  }
  return data[col.field];
}

const getSelectedCellOption = (selectedValue: string | number, selectCfg: any) => {
  const { options, valueProp = 'id' } = selectCfg;
  return options.find((o: any) => o[valueProp] == selectedValue);
}

function pageChanged(pageState: PageState) {
  emit('paging', { page: pageState.page + 1, limit: pageState.rows });
}


onMounted(() => {
  emit('paging', { page: 1, limit: defaultRowsPerPage.value });
});
</script>

<template>
  <DataTable :value="props.data" tableStyle="min-width: 50rem" scrollable scrollHeight="500px"
    v-model:editingRows="editingRows" editMode="row" dataKey="id" @row-edit-save="onRowEditSave"
    v-model:filters="filters" filterDisplay="menu" :globalFilterFields @filter="onFilter"
    :pt="pt">
    <template #header class="relative">
      <div class="flex flex-col md:flex-row sm:flex-wrap justify-between">
        <span v-if="props.name" class="text-l font-bold">{{props.name}}</span>
        <div class="grow flex flex-row justify-end flex-wrap gap-2">
          <Button icon="pi pi-refresh" rounded variant="outlined" @click="emit('refresh')" v-tooltip="'Làm mới'" class="col-span-1 !self-center !justify-self-end"/>
          <slot name="headerTools" />
          <div class="w-full sm:w-90 lg:w-120 flex justify-end gap-2">
          <div class="w-1/2 sm:w-45 lg:w-60">
            <MultiSelect v-if="colToggleable" v-model="selectedCols" :options="cols" optionLabel="header" optionValue="field"
              :maxSelectedLabels="3" display="chip" placeholder="Chọn các cột" class="w-full" />
          </div>
          <div class="w-1/2 sm:w-45 lg:w-60">
            <IconField class="w-full">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Tìm kiếm" class="w-full"/>
            </IconField>
          </div></div>
        </div>
      </div>
      <div v-if="loading" class="absolute bottom-0 left-0 w-full">
        <ProgressBar mode="indeterminate" style="height: 3px"></ProgressBar>
      </div>
    </template>
    <template #footer>
      <Paginator :rows="defaultRowsPerPage" :totalRecords="totalRows || data.length" :rowsPerPageOptions="[1,2,5,10, 20, 50, 100]"
        @page="pageChanged"></Paginator>
    </template>
    <template #empty> Không có dữ liệu. </template>

    <Column v-for="col in enabledCols" :field="col.field" :header="col.header" style="min-width: 40%" sortable
      :filterField="col.field" :filterMenuStyle="{ width: '14rem' }" :dataType="col.type == TblColType.Date ? 'date' : undefined"
      :showFilterOperator="false" :showFilterMatchModes="col.type != TblColType.Select">
      <template v-if="col.editable" #editor="{ data, field }">
        <Select v-if="col.type == TblColType.Select" placeholder="Chọn giá trị"
          v-model="data[field]" :options="col.selectCfg?.options"
          :optionLabel="col.selectCfg?.labelProp || 'name'" :optionValue="col.selectCfg?.valueProp || 'id'" fluid>
          <template #option="{option}">
            <div v-if="col.selectCfg?.optionTemplateName">
              <slot :name="col.selectCfg.optionTemplateName" :option="option" />
            </div>
            <span v-else>
              {{ option.name }}
            </span>
          </template>
          
          <template #value="slotProps">
            <slot :name="col.selectCfg?.valueTemplateName" v-bind="slotProps"
              :selected="getSelectedCellOption(slotProps.value, col.selectCfg)" />
          </template>
        </Select>
        <DatePicker v-else-if="col.type == TblColType.Date" v-model="data[field]" dateFormat="dd/mm/yy" showIcon iconDisplay="input"  />
        <InputText v-else v-model="data[field]" fluid/>
      </template>

      <template #body="{ data }">
        <div v-if="col.useTemplate">
          <slot :name="col.templateName" :value="getCellValue(data, col)" :row="data"></slot>
        </div>
        <router-link v-else-if="col.useLink && col.basePath"
          :to="`${col.basePath}/${data['id']}`" v-slot="{ href, navigate }" >
          <a :href="href" @click="navigate" :class="'underline text-blue-600 hover:text-blue-800 visited:text-purple-600'">{{ data[col.field] }}</a>
        </router-link>
        <span v-else>
          {{ getCellValue(data, col) }}
        </span> 
      </template>
      
      <template v-if="col.filterEnabled" #filter="{ filterModel }">
        <MultiSelect v-if="col.type == TblColType.Select" placeholder="Bất kỳ"
          v-model="filterModel.value" :options="col.selectCfg?.options"
          :optionLabel="col.selectCfg?.labelProp || 'name'" :optionValue="col.selectCfg?.valueProp || 'id'">

          <template #option="{option}">
            <div v-if="col.selectCfg?.optionTemplateName">
              <slot :name="col.selectCfg.optionTemplateName" :option="option" />
            </div>
            <span v-else>
              {{ option.name }}
            </span>
          </template>
        </MultiSelect>
        <DatePicker v-else-if="col.type == TblColType.Date" v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
        <InputText v-else v-model="filterModel.value" type="text" :placeholder="`Tìm theo ${col.header}`" />
      </template>
    </Column>

    <Column v-if="props.actions.length" :style="{ 'padding-right': editable ? '0' : null , 'min-width': '20%'}"
      bodyStyle="text-align:center">
      <template #body="{data, index}">
        <Button v-for="btn in props.actions" :icon="btn.icon" :label="btn.label" @click="btn.action(data, index)"
          severity="info" variant="text" rounded v-tooltip="btn.tooltip"/>
      </template>
    </Column>
    <Column v-if="editable" :rowEditor="true" :style="{ 'padding-left': editingRows ? '0' : null }"
      bodyStyle="min-width: 6rem"></Column>

  </DataTable>
</template>

<style scoped>
::v-deep(.p-datatable-header) {
  position: relative;
}
::v-deep(td[data-p-editable-column="true"] .p-datepicker-input) {
  width: 9rem !important;
}
::v-deep(td.body-cell > *:only-child) {
  display: block;
  padding-block: 0.5rem;
}
</style>