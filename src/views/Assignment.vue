<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from "vue";

import interact from 'interactjs';
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';

import { squadServices } from '@/services/apis.service';
import { useNotify } from "@/services/toast.service";
import { getShortName } from '@/utils/common';
import { useLoadingStore } from "@/stores/app";

const loading = useLoadingStore();
const props = defineProps({schoolYearId: {type: Number, default: 1}});
const myElement = ref();
const all = ref<any[]>([]);

const squads = ref<any[]>([]);
const box = ref();
const items = ref<any[]>([]);

const { notifySuccess, notifyError } = useNotify();

watch(
  () => props.schoolYearId,
  (newId) => {
    if (newId) getSquads(newId);
  },
  { immediate: true } // Run on mount
);


async function getSquads(schoolYearId: number) {
  try {
    loading.setLoading(true);
    const data = await squadServices.getSquads({include: 'leaders', school_year_id: schoolYearId});
    squads.value = data.data.map((squad: any) => ({
      id: squad.id,
      name: squad.name,
      schoolYearId: squad.school_year_id,
      sectorId: squad.sector_id,
      sectorName: squad.sector_name,
      president: squad.squad_president && getShortName(squad.squad_president.first_name, squad.squad_president.last_name),
      vicePresidents: (squad.vice_squad_presidents || []).map((v: any) => getShortName(v.first_name, v.last_name)).join(' / '),
      updatedAt: new Date(squad.updated_at).toLocaleString('vi-VN'),
    }));    
    
    const ratio = myElement.value.clientHeight*2 / (myElement.value.clientHeight*2 + myElement.value.clientWidth);
    const v = Math.floor(Math.ceil(squads.value.length / 2) * ratio);
    const h = Math.ceil((squads.value.length - 2 * v) / 2);
    const arr = [squads.value.splice(0, v), squads.value.splice(0, h), squads.value.splice(0, v), squads.value];
    all.value = arr;
    await nextTick();
    calAvatarPos();

    loading.setLoading(false);
  } catch (err) {
    notifyError('Tải dữ liệu không thành công: ' + err)
    loading.setLoading(false);
  }
}

onMounted(() => {
  initDnd();
});

function dragMoveListener(event: any) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

function initDnd() {
  interact('.dropzone').dropzone({
    // only accept elements matching this CSS selector
    accept: '.drag-item.ready',
    // Require a 75% element overlap for a drop to be possible
    overlap: 0.75,
  
    ondropactivate: function (event) {
      // add active dropzone feedback
      event.target.classList.add('drop-active')
      event.relatedTarget.classList.add('dragging')
    },
    ondragenter: function (event) {
      var draggableElement = event.relatedTarget
      var dropzoneElement = event.target
  
      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target')
      dropzoneElement.classList.remove('dropped')
      draggableElement.classList.add('can-drop')
      draggableElement.classList.remove('dropped')
    },
    ondragleave: function (event) {
      // remove the drop feedback style
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')
    },
    ondrop: function (event) {
      event.target.classList.add('dropped')
      event.relatedTarget.classList.remove('can-drop')
      event.relatedTarget.classList.add('dropped')
    },
    ondropdeactivate: function (event) {
      // remove active dropzone feedback
      event.target.classList.remove('drop-active')
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('dragging')
    }
  });

  interact('.drag-item').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    autoScroll: true,
    // dragMoveListener from the dragging demo above
    listeners: { move: dragMoveListener }
  });
}

function calAvatarPos() {
  const rect = box.value.getBoundingClientRect();
  const parentRect = myElement.value.getBoundingClientRect();
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );

  const quadrants = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  for (let i = 0; i < 20; i++) {
    const q = quadrants[i % 4] as string; // example: cycle quadrants
    items.value.push({
      ...getRandomPosition(rect.top - parentRect.top, rect.bottom - parentRect.top - 4 * rootFontSize, rect.left - parentRect.left, rect.right - parentRect.left - 4 * rootFontSize)
    });
  }
}

function getRandomPosition(top: number, bottom: number, left: number, right: number) {
  const x = left + Math.random() * (right - left);
  const y = top + Math.random() * (bottom - top);
  
  return { x, y };
}



</script>

<template>
  <!-- <div  class="w-full h-full"> -->


  <div ref="myElement" class="flex flex-col w-full h-full gap-3 p-[1rem] relative">
    <div class="flex justify-between gap-3">
      <div v-for="(squad, i) in all[1]" v-bind:key="squad.id" v-bind:data-index="i"
        class="dropzone flex gap-4 items-center">
        <span class="flex-1">{{ squad.name }}</span>
        <div class="dropzone drop-role">
          Chi đoàn trưởng
        </div>
        <div class="dropzone drop-role">
          Chi đoàn phó
        </div>
      </div>
    </div>
    <div class="flex flex-1 gap-3">
      <div class="flex flex-col justify-around gap-3">
        <div v-for="(squad, i) in all[0]" v-bind:key="squad.id" v-bind:data-index="i"
          class="dropzone flex gap-4 items-center">
          <span class="flex-1">{{ squad.name }}</span>
          <div class="dropzone drop-role">
            Chi đoàn trưởng
          </div>
          <div class="dropzone drop-role">
            Chi đoàn phó
          </div>
        </div>
      </div>
      <div class="flex-1" ref="box">
        <div class="absolute top-0 right-0 left-0 bottom-0" v-for="(item, i) in items" :key="i">
          <!-- <div class="absolute"> -->
        <OverlayBadge :style="{ transform: `translate(${item.x}px, ${item.y}px)`}"
          v-bind:data-x="item.x" v-bind:data-y="item.y"
          value="✓" severity="info" class="inline-flex rounded-[50%] drag-item ready">
          <Avatar image="/src/assets/logo.png" size="xlarge" shape="circle" />
        </OverlayBadge>
          <!-- </div> -->
        </div>
      </div>
      <div class="flex flex-col justify-around gap-3">
        <div v-for="(squad, i) in all[2]" v-bind:key="squad.id" v-bind:data-index="i"
          class="dropzone flex gap-4 items-center">
          <span class="flex-1">{{ squad.name }}</span>
          <div class="dropzone drop-role">
            Chi đoàn trưởng
          </div>
          <div class="dropzone drop-role">
            Chi đoàn phó
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-between gap-3">
      <div v-for="(squad, i) in all[3]" v-bind:key="squad.id" v-bind:data-index="i"
        class="dropzone flex gap-4 items-center ">
        <span class="flex-1">{{ squad.name }}</span>
        <div class="dropzone drop-role">
          Chi đoàn trưởng
        </div>
        <div class="dropzone drop-role">
          Chi đoàn phó
        </div>
      </div>
    </div>
  </div>
  <!-- <div v-for="(squad, i) in squads" v-bind:key="squad.id" v-bind:data-index="i"
    class="dropzone flex gap-4 items-center">
    <span class="flex-1">{{ squad.name }}</span>
    <div class="dropzone drop-role">
      Chi đoàn trưởng
    </div>
    <div class="dropzone drop-role">
      Chi đoàn phó
    </div>
  </div> -->
  

  <!-- </div> -->
</template>


<style scoped>

.dropzone {
  height: 6rem;
  width: 17rem;
  /* height: 2.4rem;
  width: 6.8rem; */
  background-color: #fafafa;
  border: 2px dashed #ccc;
  border-radius: 6px;
  /* margin: 10px auto 30px; */
  padding: 5px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.dropzone.drop-role {
  border-style: dashed;
  border-radius: 50%;
  width: 4.5rem;
  height: 4.5rem;
  /* width: 1.8rem;
  height: 1.8rem; */
  margin: 0;
  padding: 0.5rem;
  font-size: 0.75rem;
  text-align: center;
}

/* --- 1. DRAGGING (when item is being dragged anywhere) --- */
.dropzone.drop-active {
  border-color: #999;
  background: #f2f2f2;
  opacity: 0.9;
}

/* --- 2. DRAG OVER (when pointer enters dropzone) --- */
.dropzone.drop-target {
  border-color: #4aa9ff;
  background: #e8f3ff;
  transform: scale(1.03);
  box-shadow: 0 0 8px rgba(74, 169, 255, 0.4);
  transform-origin: center;
  overflow: visible;
}

/* --- 3. DROPPED (after item released here) --- */
.dropzone.dropped {
  border-color: #4caf50;
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
  transform: scale(1);
}

:deep(.p-badge) {
  transform: translate(10%,-10%) !important;
  outline-style: none !important;
  display: none;
}

.drag-item.dropped ::v-deep .p-badge {
  display: inline-flex;
}

.drag-item {
  touch-action: none;
  transform: translate(0px, 0px);

  transition: box-shadow 0.15s ease, opacity 0.15s ease;
  z-index: 9999;

  border: 1px solid #ccc;
  cursor: grab !important;
}

.drag-item.dragging {
  /* cursor: grabbing !important; */
  opacity: 0.8;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.drag-item.can-drop {
  border: 2px dashed #4aa9ff;
}


</style>
