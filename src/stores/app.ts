import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', () => {
  const loading = ref(false);

  function setLoading(state: boolean) {
    loading.value = state;
  }

  return { loading, setLoading };
});

export const useAppReadyStore = defineStore('appReady', () => {
  const appReady = ref(false);

  function setReady() {
    appReady.value = true;
  }

  return { appReady, setReady };
});