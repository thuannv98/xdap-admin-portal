import { createRouter, createWebHistory, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import HomeView from '../views/Home.vue';
import Squads from '@/views/Squads.vue';
import SquadDetails from '@/views/SquadDetails.vue';
import Members from '@/views/Members.vue';
import Leaders from '@/views/Leaders.vue';
import Assignment from '@/views/Assignment.vue';
import Sector from '@/views/Sector.vue';
import ComingSoon from '@/views/ComingSoon.vue';
import SetupAdmin from '@/views/SetupAdmin.vue';
import Login from '@/views/Login.vue';
import { useAuthStore } from '@/stores/auth';
import { useAppReadyStore } from '@/stores/app';

const routes = [
  { path: '/', component: HomeView },
  { path: '/chi-doan', component: Squads },
  { path: '/chi-doan/phan-nhiem', component: Assignment,
    meta: {
      breadcrumb: [{ label: 'Chi đoàn', to: '/chi-doan' }, { label: 'Phân nhiệm' }]
    }
   },
  { path: '/chi-doan/:id', component: SquadDetails,
    meta: {
      breadcrumb(route: RouteLocationNormalizedLoadedGeneric) {
        return [
          { label: 'Chi đoàn', to: '/chi-doan' },
          { label: `Chi đoàn ${route.params.id}` }
        ];
      }

    }
   },
  { path: '/nganh', component: ComingSoon },
  { path: '/ban', component: ComingSoon },
  { path: '/doan-sinh', component: Members },
  { path: '/huynh-truong', component: Leaders },
  { path: '/ghi-chu', component: ComingSoon },
  { path: '/lich', component: ComingSoon },
  { path: '/message', component: ComingSoon },
  { path: '/login', name: 'login', component: Login, meta: { isActionPage: true } },
  { path: '/onboarding', name: 'onboarding', component: SetupAdmin, meta: { isActionPage: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeResolve(async (to, from) => {
  const auth = useAuthStore();
  const appReady = useAppReadyStore();
  const routeName = typeof to.name === 'string' ? to.name : '';

  if (['login', 'onboarding'].includes(routeName)) {
    appReady.setReady();
    return true;
  }

  await auth.checkSession();

  appReady.setReady();

  if (auth.setupRequired) {
    auth.loaded = false;
    auth.setupRequired = false;
    return { name: 'onboarding' };
  }

  if (!auth.user) {
    auth.loaded = false;
    return { name: 'login' };
  }

  return true;
})


export default router
