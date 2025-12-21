import { defineStore } from 'pinia';

import { leaderRolesServices, schoolYearServices } from '@/services/apis.service';

export const useActiveSchoolYearStore = defineStore('activeYear', {
  state: (): {yearInstance: any} => ({ yearInstance: null }),
  actions: {
    async fetch(schoolYears?: any[]) {
      // fetch school years list or use provided data to set active school year
      const data = schoolYears || await schoolYearServices.getSchoolYears();
      const active = data.find((s: any) => s.is_active);
      if (active) {
        this.yearInstance = active;
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