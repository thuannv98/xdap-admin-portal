<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

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
import OrgChart from '@/components/OrgChart.vue';
import Avatar from '@/components/Avatar.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import MembersTable from './children/MembersTable.vue';
import {
  squadServices, schoolYearServices, sectorsServices,
  leaderServices, leaderRolesServices, squadRolesServices,
squadLeaderServices
} from '@/services/apis.service';
import { useNotify } from "@/services/toast.service";
import { getLeaderAvatar, getLeaderFullName, processLeaderRole } from '@/utils/common';
import { useLoadingStore } from "@/stores/app";

const loading = useLoadingStore();
const { notifySuccess, notifyError, notifyInfo } = useNotify();
const confirm = useConfirm();
const route = useRoute();
const squadId = ref(route.params.id);


// data
const squad = ref<any>({});
const schoolYear = ref<any>({});
const members = ref<any[]>([]);
const leaderRoles = ref<any[]>([]);
const orgChartData = ref<any>();
const captains = ref<any[]>([]);
const parentRepresentatives = ref<any[]>([]);

const tblLoading = ref(false);

async function getSquad() {
  try {
    const data = await squadServices.getSquad(Number(squadId.value), true);
    squad.value = data;
  } catch (err) {
    throw err;
  }
}

async function getSchoolYear(id: number) {
  try {
    const data = await schoolYearServices.getSchoolYear(id);
    schoolYear.value = data;
  } catch (err) {
    throw err;
  }
}

async function getLeaderRoles() {
  try {
    const data = await leaderRolesServices.getLeaderRoles();
    leaderRoles.value = data.map((role: any) => {
      role.longName = processLeaderRole(role.name, role.level);
      return role;
    });
  } catch (err) {
    throw err;
  }
}

async function getMembers() {
  try {
    tblLoading.value = true;
    const data = await squadServices.getMembers(Number(squadId.value));
    members.value = data.map((assignment: any) => {
      const member = assignment.member_details;
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
    tblLoading.value = false;
  } catch (err) {
    tblLoading.value = false;
  }
}

function generateOrgChart() {
  if (!squad.value.squad_president && !squad.value.vice_squad_presidents?.length) {
    orgChartData.value = null;
    return;
  }
  const squadPresident = squad.value.squad_president;
  const presidentLeaf = {
    key: `0`,
    type: 'person',
    data: squadPresident ? {
      image: getLeaderAvatar(squadPresident),
      name: getLeaderFullName(squadPresident),
      title: 'Chi Đoàn Trưởng',
      phone: squadPresident.phone,
      role: leaderRoles.value.find((r: any) => r.id == squadPresident.role_id)
    } : null
  };
  const vicesLeaf = squad.value.vice_squad_presidents.map((vice: any, index: number) => {
    const role = leaderRoles.value.find((r: any) => r.id == vice.role_id);
    return {
      key: `0_${index}`,
      type: 'person',
      data: {
        image: getLeaderAvatar(vice),
        name: getLeaderFullName(vice),
        title: 'Chi Đoàn Phó',
        phone: vice.phone,
        role
      }
    };
  });
  orgChartData.value = {
    ...presidentLeaf,
    children: vicesLeaf
  };
}

onMounted(async () => {
  loading.setLoading(true);
  await Promise.all([
    getSquad().then(() => {
      if (squad.value.school_year_id) {
        getSchoolYear(squad.value.school_year_id);
      }
    }),
    getLeaderRoles(),
    getMembers()
  ]);
  generateOrgChart();
  loading.setLoading(false);
});

</script>

<template>
  <Panel>
    <header class="flex justify-between items-center gap-4 mb-4">
      <div class="flex flex-col gap-2">
        <h1 class="leading-none font-semibold">{{ squad.name || 'Chi Đoàn' }}</h1>
        <div class="text-[#6b7280] text-sm mt-[4px] flex flex-col sm:flex-row gap-1">
          <span>Mã chi đoàn: <strong>{{ squad.id || '-' }}</strong></span>
          <span class="text-[#cbd5e1] px-2 hidden sm:inline">•</span>
          <span>Năm học: <strong>{{ schoolYear?.name || '-' }}</strong></span>
        </div>
      </div>
      <div class="actions">
        <Button icon="pi pi-refresh" label="Làm mới" severity="primary" variant="text" @click="getSquad"></Button>
      </div>
    </header>

    <section class="grid grid-cols-3 gap-4">
      <aside class="col-span-3 xl:col-span-2 grid gap-4 grid-cols-2">
        <div class="card info-card col-span-2 md:col-span-1 lg:col-span-1">
          <h3 class="card-title">Thông tin chi đoàn</h3>
          <div>
            <div class="row"><span class="label">Tên:</span> <span class="value">{{ squad.name || '-' }}</span></div>
            <div class="row"><span class="label">Sĩ số:</span> <span class="value">{{ members.length || '-' }}</span></div>
            <div class="row"><span class="label">Vị trí học:</span> <span class="value">{{ route.params.code || '-' }}</span></div>
            <div class="row"><span class="label">Vị trí tham dự Thánh lễ:</span> <span class="value">{{ route.params.code || '-' }}</span></div>
          </div>
        </div>

        <div class="card col-span-2 md:col-span-1 lg:col-span-1">
          <h3 class="card-title">Thống kê nhanh</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="stat col-span-1">
              <div class="stat-value">{{ members.length || 0 }}</div>
              <div class="placeholder">Đoàn sinh</div>
            </div>
            <div class="stat col-span-1">
              <div class="stat-value">{{ (squad.squad_president ? 1 : 0) + (squad.vice_squad_presidents?.length || 0) }}</div>
              <div class="placeholder">Giáo lý viên</div>
            </div>
            <div class="stat col-span-1">
              <div class="stat-value">{{ captains.length || 0 }}</div>
              <div class="placeholder">Đội trưởng</div>
            </div>
            <div class="stat col-span-1">
              <div class="stat-value">{{ parentRepresentatives.length || 0 }}</div>
              <div class="placeholder">Đại diện Phụ huynh</div>
            </div>
          </div>
        </div>

        <div class="card col-span-2">
          <h3 class="card-title">Phân nhiệm</h3>
          <OrgChart :data="orgChartData" emptyLabel="Chưa có phân nhiệm" />
        </div>
      </aside>

      <aside class="col-span-3 xl:col-span-1 flex flex-col lg:flex-row lg:flex-wrap content-start gap-4">
        <div class="card w-full">
          <h3 class="card-title">Giáo lý viên</h3>
          <div class="flex flex-col gap-3">
            <div v-if="squad.squad_president" class="flex gap-3 items-center">
              <Avatar :src="getLeaderAvatar(squad.squad_president)" size="xlarge" shape="square" />
              <!-- <img class="w-[5rem] h-[5rem] rounded-2xl object-cover border-2 border-[rgba(99,102,241,0.08)]" src="@/assets/logo.png" alt="president" /> -->
              <div>
                <div class="font-bold text-[#111827]">{{ getLeaderFullName(squad.squad_president) || '-' }}</div>
                <div class="text-[#6b7280] text-[0.9rem]">{{ leaderRoles.find(r => r.id == squad.squad_president?.role_id)?.longName || 'Chi Đoàn Trưởng' }}</div>
                <div class="text-[#6b7280] text-[0.85rem]">{{ squad.squad_president?.phone || '-' }}</div>
              </div>
            </div>

            <div v-for="(vice, i) in squad.vice_squad_presidents || []" :key="i" class="person">
              <img alt="vice" class="avatar" :src="getLeaderAvatar(vice)"/>
              <div>
                <div class="name">{{ getLeaderFullName(vice) }}</div>
                <div class="role">{{ leaderRoles.find(r => r.id == vice.role_id)?.longName || 'Chi Đoàn Phó' }}</div>
                <div class="phone">{{ vice?.phone || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card w-full">
          <h3 class="card-title">Đội trưởng</h3>
          <div v-for="(captain, i) in captains || []" :key="i" class="person">
            <img alt="captain" class="avatar"  src="@/assets/logo.png"/>
            <div>
              <div class="name">{{ getLeaderFullName(captain) }}</div>
            </div>
          </div>
        </div>

        <div class="card w-full">
          <h3 class="card-title">Đại diện Phụ huynh</h3>
          <div v-for="(rep, i) in parentRepresentatives || []" :key="i" class="person">
            <img class="avatar"  src="@/assets/logo.png"/>
            <div>
              <div class="name">{{ getLeaderFullName(rep) }}</div>
              <div class="phone">{{ rep?.phone || '-' }}</div>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <div class="card mt-4">
      <MembersTable :data="members" :loading="tblLoading" @refresh="getMembers" />
    </div>
  </Panel>
</template>

<style scoped>
.person { display: flex; gap: 0.5rem; align-items: center; padding: 0.35rem 0.5rem }
.person .name { font-size: 0.92rem; font-weight: 600; }
.person .role { color: #6b7280; font-size: 0.82rem; }
.person .phone { color: #6b7280; font-size: 0.75rem; }
.person .avatar { width: 3rem; height: 3rem;  object-fit: cover; margin-right: 0.5rem; }

.card { background: #ffffff; border-radius: 10px; box-shadow: 0 6px 18px rgba(16,24,40,0.06); padding: 1rem; border: 1px solid rgba(15, 23, 42, 0.04); }
.card-title { font-size: 0.95rem; color: #111827; margin-bottom: 0.6rem; font-weight: 600; }
.card-body { display:block; }
.info-card .row { display:flex; justify-content:space-between; padding: 0.45rem 0; border-bottom: 1px dashed rgba(15,23,42,0.03); }
.info-card .row:last-child { border-bottom: none; }
.label { color:#6b7280; }
.value { color:#111827; font-weight:600 }

.stat { flex:1; text-align:center; padding:0.6rem; background: linear-gradient(180deg, #fbfdff, #f8fafc); border-radius:8px; }
.stat-value { font-size:1.2rem; font-weight:700; color:#047857 }
</style>