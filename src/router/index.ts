import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/chi-doan', component: HomeView  },
  { path: '/nganh', component: HomeView },
  { path: '/ban', component: HomeView },
  { path: '/doan-sinh', component: HomeView },
  { path: '/huynh-truong', component: HomeView },
  { path: '/ghi-chu', component: HomeView },
  { path: '/lich', component: HomeView },
  { path: '/message', component: HomeView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
