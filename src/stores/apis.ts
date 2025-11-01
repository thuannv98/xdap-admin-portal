import { defineStore } from 'pinia';

import { leaderRolesServices, schoolYearServices } from '@/services/apis.service';

export const useActiveSchoolYearStore = defineStore('activeYear', {
  state: () => ({ id: null, name: '' }),
  actions: {
    async fetch() {
      // fetch and set active school year
      const data = await schoolYearServices.getSchoolYears();
      const active = data.find((s: any) => s.is_active);
      if (active) {
        this.id = active.id;
        this.name = active.name;;
      }
    }
  },
});

export const useLeaderRolesStore = defineStore('leaderRoles', {
  state: (): {roles: any[]} => ({ roles: []}),
  actions: {
    async fetch() {
      // fetch and set leader roles
      const data = await leaderRolesServices.getLeaderRoles();
      this.roles = data;
    }
  },
});