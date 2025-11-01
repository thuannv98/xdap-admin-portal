<script lang="ts" setup>
import { ref, onMounted } from "vue";

import Chart from 'primevue/chart';

import Panel from '@/components/Panel.vue';
import { useActiveSchoolYearStore, useLeaderRolesStore } from '@/stores/apis';

const activeYear = useActiveSchoolYearStore();
const leaderRoles = useLeaderRolesStore();



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

onMounted(async () => {
  try {
    if (!activeYear.id) {
      await activeYear.fetch();
    }
    if (!leaderRoles.roles.length) {
        await leaderRoles.fetch();
    }
  
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
</template>
