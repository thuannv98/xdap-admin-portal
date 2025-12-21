<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";

import Chart from 'primevue/chart';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import { useConfirm } from "primevue/useconfirm";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { Form } from "@primevue/forms";
import Button from "primevue/button";
import Popover from 'primevue/popover';
import InputGroup from 'primevue/inputgroup';
import Galleria from "primevue/galleria";
import z from "zod";

import { Calendar } from 'v-calendar';
import 'v-calendar/style.css';

import Input from "@/components/forms/Input.vue";
import Select from "@/components/forms/Select.vue";
import DatePicker from "@/components/forms/DatePicker.vue";
import Panel from '@/components/Panel.vue';
import { useActiveSchoolYearStore, useLeaderRolesStore } from '@/stores/apis';
import { useLoadingStore } from "@/stores/app";
import { useNotify } from "@/services/toast.service";
import { leaderServices, memberServices, micsServices, schoolYearServices, squadServices } from "@/services/apis.service";
import { displayDate, preProcessDateInput } from "@/utils/common";
import { useAuthStore } from "@/stores/auth";

const confirm = useConfirm();
const activeYearStore = useActiveSchoolYearStore();
const leaderRolesStore = useLeaderRolesStore();
const loadingStore = useLoadingStore();
const auth = useAuthStore();
const { notifySuccess, notifyError, notifyInfo } = useNotify();
const isEditor = computed(() => auth.hasRole('editors'));

const schoolYears = ref<any[]>([]);
const schoolYearsLoading = ref<boolean>(false);
const activeYear = ref();
const op = ref();

const formVisible = ref(false);
const resolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Vui lòng nhập tên năm học.' }),
    start: z.preprocess(preProcessDateInput,
      z.date({ message: 'Ngày không hợp lệ.' }).nullable()
    ),
    end: z.preprocess(preProcessDateInput,
      z.date({ message: 'Ngày không hợp lệ.' }).nullable()
    ),
    active: z.boolean('Giá trị không hợp lệ.')
  })
));
const initialValues = ref({
  name: '',
  start: displayDate(new Date()),
  end: '',
  active: true
});
const stats = ref<{
  members: any,
  leaders: any,
  squads: any,
}>({ members: {}, leaders: {}, squads: {} });

const calendarAttributes = ref<any[]>([
  {
    highlight: 'purple',
    dates: new Date(),
  },
]);
const activitiesImg = ref([]);

const chartData = ref();
const chartOptions = ref();
const chartDataBar = ref();
const chartOptionsBar = ref();
const chartData3 = ref();
const chartOptions3 = ref();
const chartData4 = ref();
const chartOptions4 = ref();

const setChartData = () => {
    const documentStyle = getComputedStyle(document.body);

    return {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [540, 325, 702],
                backgroundColor: [documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-gray-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-cyan-400'), documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-gray-400')]
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: textColor
                }
            }
        }
    };
};

const setChartDataBar = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'My First dataset',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: 'My Second dataset',
                backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
                borderColor: documentStyle.getPropertyValue('--p-gray-500'),
                data: [28, 48, 40, 19, 86, 27, 90]
            }
        ]
    };
};
const setChartOptionsBar = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

const setChartData3 = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        datasets: [
            {
                data: [11, 16, 7, 3, 14],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-pink-500'),
                    documentStyle.getPropertyValue('--p-gray-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-cyan-500')
                ],
                label: 'My dataset'
            }
        ],
        labels: ['Pink', 'Gray', 'Orange', 'Purple', 'Cyan']
    };
};
const setChartOptions3 = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            r: {
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

const setChartData4 = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
        datasets: [
            {
                label: 'My First dataset',
                borderColor: documentStyle.getPropertyValue('--p-gray-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-gray-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-gray-400'),
                data: [65, 59, 90, 81, 56, 55, 40]
            },
            {
                label: 'My Second dataset',
                borderColor: documentStyle.getPropertyValue('--p-pink-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-pink-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-pink-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-pink-400'),
                data: [28, 48, 40, 19, 96, 27, 100]
            }
        ]
    };
};
const setChartOptions4 = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            r: {
                grid: {
                    color: textColorSecondary
                }
            }
        }
    };
}

async function getSchoolYears() {
  try {
    const data = await schoolYearServices.getSchoolYears();
    schoolYears.value = data;
  } catch (err: any) {
    schoolYears.value = [];
    notifyError(err.message);
  }
}

async function setActiveYear(id: number, onSuccess?: () => void, setByCreatedYear?: boolean, createFn?: () => Promise<any>) {
  if (id === activeYearStore.yearInstance?.id) {
    notifyInfo('Năm học hiện tại đang hoạt động.');
    return;
  }
  const setActiveFn = setByCreatedYear && typeof createFn === 'function' ? createFn : updateYearInfo.bind(null, id, { is_active: true });
  if (activeYearStore.yearInstance) {
    const activeYearName = activeYearStore.yearInstance.name || schoolYears.value.find(s => s.id === activeYearStore.yearInstance.id)?.name || 'cũ';
    confirm.require({
      message: `Năm học ${activeYearName} chưa kết thúc. Đóng năm học ${activeYearName} và bắt đầu năm học mới?`,
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
      accept: async () => {
        try {
          loadingStore.setLoading(true);
          await updateYearInfo(activeYearStore.yearInstance.id, { is_active: false });
          await setActiveFn();
          notifySuccess('Năm học đã bắt đầu.');
          loadingStore.setLoading(false);
          await activeYearStore.fetch();
          typeof onSuccess === 'function' && onSuccess();
        } catch (err) {
          loadingStore.setLoading(false);
        }
      }
    });
    return;
  } else {
    try {
      loadingStore.setLoading(true);
      await setActiveFn();
      const yearInstance = schoolYears.value.find(s => s.id === id);
      if (yearInstance) {
        yearInstance.is_active = true;
        await activeYearStore.fetch();
      }
      notifySuccess('Năm học đã bắt đầu.');
      loadingStore.setLoading(false);
      typeof onSuccess === 'function' && onSuccess();
    } catch (err) {
      loadingStore.setLoading(false);
    }
  }
}

async function updateYearInfo(id: number, data: any) {
  try {
    await schoolYearServices.updateSchoolYear(id, data);
  } catch (err: any) {
    notifyError(err.message);
  }
}

async function createSchoolYear(schoolYearData: any) {
  try {
    const data = await schoolYearServices.createSchoolYear(schoolYearData);
    notifySuccess('Năm học đã được tạo.');
  } catch (err: any) {
    notifyError(err.message);
    throw err;
  }
}

async function onFormSubmit({ valid, values }: { valid: boolean, values: any }) {
  if (valid) {
    const data = {
      name: values.name,
      start_date: values.start,
      end_date: values.end,
      is_active: values.active,
    };
    if (values.active) {
      await setActiveYear(-1, () => {
        formVisible.value = false;
      }, true, createSchoolYear.bind(null, data));
    } else {
      loadingStore.setLoading(true);
      await createSchoolYear(data);
      await getSchoolYears();
      loadingStore.setLoading(false);
      formVisible.value = false;
    }
  }
};

const toggleOp = (event: any) => {
  op.value.toggle(event);
}

onMounted(async () => {
  try {
    await getSchoolYears();
    if (!activeYearStore.yearInstance) {
      await activeYearStore.fetch(schoolYears.value);
      if (activeYearStore.yearInstance) {
        activeYear.value = activeYearStore.yearInstance.id;
      }
    }

    const apis = [
      memberServices.getStats(),
      leaderServices.getStats(),
      squadServices.getStats(activeYearStore.yearInstance.id),
      micsServices.getActivities(),
    ];
    if (!leaderRolesStore.roles.length) {
      apis.push(leaderRolesStore.fetch());
    }

    const [memberStats, leaderStats, squadStats, activities] = await Promise.all(apis);
    stats.value = {
      members: memberStats || {},
      leaders: leaderStats || {},
      squads: squadStats || {},
    };
    activitiesImg.value = activities;
  
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
  
    chartDataBar.value = setChartDataBar();
    chartOptionsBar.value = setChartOptionsBar();
  
    chartData3.value = setChartData3();
    chartOptions3.value = setChartOptions3();
  
    chartData4.value = setChartData4();
    chartOptions4.value = setChartOptions4();
  } catch (error) {
    console.error('err', error);
  }
});
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-7 2xl:grid-cols-4">
    <div class="col-span-1 xl:col-span-5 2xl:col-span-3">
      <div class="w-full grid grid-cols-2">
        <div class="w-full col-span-2 sm:col-span-1">
          <Panel>
            <template #header>
              <div class="w-full flex justify-between">
                <div class="flex w-full justify-between items-center flex-col md:flex-row">
                  <span class="font-bold">Năm học hiện tại</span>
                </div>
                <Button v-if="isEditor" icon="pi pi-pencil" variant="text" rounded @click="toggleOp"
                  v-tooltip="'Bắt đầu năm học'" size="small" />
                <Popover ref="op">
                  <div class="w-[15rem]">
                    <span class="font-medium block mb-2">Chọn năm học để bắt đầu</span>
                    <InputGroup>
                      <Select v-model="activeYear" :options="schoolYears" class="w-full md:w-56"
                        :optionValue="null" :loading="schoolYearsLoading" placeholder="Năm học">
                      </Select>
                      <Button :disabled="activeYear?.id === activeYearStore.yearInstance?.id" icon="pi pi-check" v-tooltip="'Lưu'" @click="setActiveYear(activeYear.id)"></Button>
                    </InputGroup>
                  </div>
              </Popover>
              </div>
            </template>
              <div class="text-center flex-1 pb-2">
                <span class="font-bold text-2xl text-(--p-button-text-primary-color)" style="font-family: 'Museo Moderno', cursive">{{ activeYearStore.yearInstance?.name || '-' }}</span>
              </div>
              <div v-if="activeYearStore.yearInstance" class="text-center text-sm italic font-medium text-gray-400 dark:text-gray-400 leading-2">
                {{ `Từ ${displayDate(activeYearStore.yearInstance.start_date) || '_'}` }}
                {{ `Đến ${displayDate(activeYearStore.yearInstance.end_date) || '_'}` }}
              </div>
            <div class="w-full pt-4">
              <Button :disabled="!isEditor" @click="formVisible=true" severity="secondary" label="Năm học mới" class="w-full" />
            </div>
            <Dialog v-model:visible="formVisible" modal header="Năm học mới" :style="{ width: '25rem' }">
              <span class="text-surface-500 dark:text-surface-400 block mb-8">Nhập thông tin năm học mới.</span>
              <Form ref="form" v-slot="$form" :resolver :initialValues @submit="onFormSubmit"
                class="w-full">
                <div class="p-2 w-full rounded-xl">
                  <Input name="name" type="text" label="Tên năm học" fluid
                    :validation=true :invalid="$form.name?.invalid" :errMsg="$form.name?.error?.message" />
                </div>
                <div class="p-2 w-full rounded-xl">
                  <DatePicker name="start" label="Ngày bắt đầu" fluid
                    :validation=true :invalid="$form.start?.invalid" :errMsg="$form.start?.error?.message" />
                </div>
                <div class="p-2 w-full rounded-xl">
                  <DatePicker name="end" label="Ngày kết thúc" fluid
                    :validation=true :invalid="$form.end?.invalid" :errMsg="$form.end?.error?.message" />
                </div>
                <div class="p-2 w-full flex items-center gap-2">
                  <Checkbox name="active" inputId="schoolYearActive"  binary />
                  <label for="schoolYearActive">Bắt đầu năm học này</label>
                </div>
                <div class="pt-4 flex gap-2 justify-end items-center">
                  <Button @click="$form.reset()" severity="secondary" label="Xoá" />
                  <Button type="submit" severity="primary" label="Tạo" />
                </div>
              </Form>
            </Dialog>
          </Panel>
        </div>
        <div class="w-full col-span-2 sm:col-span-1">
          <Panel headless noPad>
            <Galleria :value="activitiesImg" :numVisible="5" containerStyle="max-width: 640px" :showThumbnails="false" autoPlay circular
              :showIndicators="true" :changeItemOnIndicatorHover="true" :indicatorsPosition="'left'">
              <template #item="slotProps">
                  <img :src="slotProps.item.url" :alt="slotProps.item.alt" style="width: 100%; display: block" />
              </template>
            </Galleria>
          </Panel>
        </div>
      </div>
      <div class="m-3 grid grid-cols-4 gap-4">
        <div class="stat col-span-1 bg-violet-200">
          <div class="text-sm bg-green-100 text-green-600 px-2 py-0.5 rounded-full w-fit">
            <i class="pi pi-arrow-up" style="font-size: 0.75rem" /> 15%
          </div>
          <div class="stat-value !text-gray-800">{{ stats.members.total || 0 }}</div>
          <div class="placeholder !text-gray-500">Đoàn sinh</div>
        </div>
        <div class="stat col-span-1 bg-yellow-200">
          <div class="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full w-fit">
            <i class="pi pi-arrow-down" style="font-size: 0.75rem" /> 15%
          </div>
          <div class="stat-value !text-gray-800">{{ stats.leaders.huynh_truong + stats.leaders.du_truong || 0 }}</div>
          <div class="placeholder !text-gray-500">Huynh Dự Trưởng</div>
        </div>
        <div class="stat col-span-1 bg-violet-200">
          <div class="text-sm bg-green-100 text-green-600 px-2 py-0.5 rounded-full w-fit">
            <i class="pi pi-arrow-up" style="font-size: 0.75rem" /> 15%
          </div>
          <div class="stat-value">{{ stats.leaders.tro_uy || 0 }}</div>
          <div class="placeholder">Trợ Uý</div>
        </div>
        <div class="stat col-span-1 bg-yellow-200">
          <div class="text-sm bg-green-100 text-green-600 px-2 py-0.5 rounded-full w-fit">
            <i class="pi pi-arrow-up" style="font-size: 0.75rem" /> 15%
          </div>
          <div class="stat-value">{{ stats.squads.total }}</div>
          <div class="placeholder">Chi Đoàn</div>
        </div>
      </div>
  <div class="flex flex-col sm:flex-row ">
    <div class="w-full sm:w-1/2">
      <Panel title="Chi đoàn">
        <div class="card flex justify-center">
          <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full" />
        </div>
      </Panel>
      <Panel title="Huynh trưởng">
        <div class="card flex justify-center">
          <Chart type="polarArea" :data="chartData3" :options="chartOptions3" class="w-full md:w-[30rem]" />
      </div>
      </Panel>
    </div>
    <div class="w-full sm:w-1/2">
      <Panel title="Đoàn sinh">
        <div class="card">
          <Chart type="bar" :data="chartDataBar" :options="chartOptionsBar" class=""  />
        </div>
      </Panel>
      <Panel title="Ban ngành">
        <div class="card flex justify-center">
          <Chart type="radar" :data="chartData4" :options="chartOptions4" class="w-full md:w-[30rem]" />
      </div>
      </Panel>
    </div>
  </div>
    </div>
    <div class="col-span-1 xl:col-span-2 2xl:col-span-1">
      <Panel headless noPad>
        <Calendar :attributes="calendarAttributes" borderless transparent expanded view="weekly" locale="vi" />
        <div class="py-4 px-6 w-full h-[18rem] overflow-y-auto">
          <div class="py-4 flex justify-between items-center">
            <h2 class="font-semibold text-lg">Sự kiện sắp tới</h2>
            <Button icon="pi pi-bell" variant="text" rounded />
          </div>
          <div class="flex flex-col gap-[1.5rem]">
            <div class="flex items-center space-x-4">
              <div class="flex-grow-0 flex-shrink-0">
                <div class="flex justify-center items-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-500 dark:bg-indigo-400 dark:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M15 1.784l-.796.796a1.125 1.125 0 101.591 0L15 1.784zM12 1.784l-.796.796a1.125 1.125 0 101.591 0L12 1.784zM9 1.784l-.796.796a1.125 1.125 0 101.591 0L9 1.784zM9.75 7.547c.498-.02.998-.035 1.5-.042V6.75a.75.75 0 011.5 0v.755c.502.007 1.002.021 1.5.042V6.75a.75.75 0 011.5 0v.88l.307.022c1.55.117 2.693 1.427 2.693 2.946v1.018a62.182 62.182 0 00-13.5 0v-1.018c0-1.519 1.143-2.829 2.693-2.946l.307-.022v-.88a.75.75 0 011.5 0v.797zM12 12.75c-2.472 0-4.9.184-7.274.54-1.454.217-2.476 1.482-2.476 2.916v.384a4.104 4.104 0 012.585.364 2.605 2.605 0 002.33 0 4.104 4.104 0 013.67 0 2.605 2.605 0 002.33 0 4.104 4.104 0 013.67 0 2.605 2.605 0 002.33 0 4.104 4.104 0 012.585-.364v-.384c0-1.434-1.022-2.7-2.476-2.917A49.138 49.138 0 0012 12.75zM21.75 18.131a2.604 2.604 0 00-1.915.165 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-2.33 0 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-2.33 0 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-1.915-.165v2.494c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-2.494z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-grow flex justify-between items-center">
                <div class="flex flex-col gap-2">
                  <p class="font-medium">Sinh nhật cha tuyên uý</p>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-400 leading-2">Chúa Nhật, 21/12/2025, 10:00</p>
                </div>
              </div>
              <div class="form-check form-switch self-start mt-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                  </div>
                </label>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex-grow-0 flex-shrink-0">
                <div class="flex justify-center items-center w-10 h-10 rounded-lg bg-blue-100 text-blue-500 dark:bg-blue-400 dark:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-grow flex justify-between items-center">
                <div class="flex flex-col gap-2">
                  <p class="font-medium">Hoa thiêng Giáng sinh</p>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-400 leading-2">Chúa Nhật, 21/12/2025, 09:00</p>
                </div>
              </div>
              <div class="form-check form-switch self-start mt-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                  </div>
                </label>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex-grow-0 flex-shrink-0">
                <div class="flex justify-center items-center w-10 h-10 rounded-lg bg-red-100 text-red-500 dark:bg-red-400 dark:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-grow flex justify-between items-center">
                <div class="flex flex-col gap-2">
                  <p class="font-medium">Diễn nguyện Giáng sinh</p>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-400 leading-2">Thứ tư, 24/12/2025, 19:30</p>
                </div>
              </div>
              <div class="form-check form-switch self-start mt-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
  
                  </div><!---->
                </label>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <template #header>
          <div class="w-full flex justify-between items-center">
            <span class="font-bold">Tin nhắn</span>
            <Button label="Xem tất cả" severity="secondary" variant="text" rounded />
          </div>
        </template>
      </Panel>
    </div>
  </div>
</template>

<style scoped>
.stat { flex:1; text-align:center; padding:0.6rem; border-radius:8px; }
.stat-value { font-size:1.2rem; font-weight:700; color:#047857 }
</style>
