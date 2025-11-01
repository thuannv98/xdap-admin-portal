import { defineStore } from 'pinia'
import { authService } from '@/services/apis.service';

export const useAuthStore = defineStore('auth', {
  state: (): { setupRequired: boolean, user: any; loaded: boolean } => ({
    setupRequired: false,
    user: null,
    loaded: false,
  }),

  actions: {
    async checkSession() {
      if (this.loaded) return;

      try {
        const data = await authService.getUserInfo();
        if (data.setupRequired) {
          this.setupRequired = true;
        } else {
          this.user = data;
        }
        this.loaded = true;
      } catch (err) {
        this.user = null
      }
    },
  }
})
