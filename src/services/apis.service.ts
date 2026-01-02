import { API_PATHS, type SquadLeaderAssignment, type SquadMemberAssignment } from '@/constants';
import { apiV1, apiV2 } from './http.service';
import { processLeaderRole } from '@/utils/common';

export const micsServices = {

  getActivities() {
    return apiV1.get(`activities`);
  }
};

export const saintServices = {
  path: API_PATHS.Saint,

  get() {
    return apiV1.get(this.path)
  }
}

export const squadServices = {
  path: API_PATHS.Squad,

  getSquads(filters: any) {
    const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
    if (query) {
      return apiV1.get(`${this.path}?${query}`);
    }
    return apiV1.get(this.path);
  },
  getSquad(squadId: number, includeLeaders = false) {
    const query = includeLeaders ? '?include=leaders' : '';
    return apiV1.get(`${this.path}/${squadId}${query}`);
  },
  createSquad(squad: any) {
    return apiV1.post(this.path, squad);
  },
  updateSquad(squadId: number, squad: any) {
    return apiV1.patch(`${this.path}/${squadId}`, squad);
  },
  deleteSquad(squadId: number) {
    return apiV1.delete(`${this.path}/${squadId}`);
  },
  getStats(schoolYearId: number) {
    return apiV1.get(`${this.path}/stats?school_year_id=${schoolYearId}`);
  },
  getLeadersAssignment(squadId: number) {
    return apiV1.get(`${this.path}/${squadId}/leaders`);
  },
  assignLeader(assignmentInfo: SquadLeaderAssignment) {
    return apiV1.post(`${this.path}/${assignmentInfo.squad_id}/leaders`, assignmentInfo);
  },
  unassignLeader(assignmentInfo: SquadLeaderAssignment) {
    return apiV1.delete(`${this.path}/${assignmentInfo.squad_id}/leaders/${assignmentInfo.leader_id}`);
  },
  updateAssignment(old: SquadLeaderAssignment, new_: SquadLeaderAssignment) {
    return apiV1.patch(`${this.path}/${old.squad_id}/leaders/${old.leader_id}`, new_);
  },
  getMembers(squadId: number) {
    return apiV1.get(`${this.path}/${squadId}/members?detailsBy=member_id`);
  },
  addMember(assignmentInfo: SquadMemberAssignment) {
    return apiV1.post(`${this.path}/${assignmentInfo.squad_id}/members`, assignmentInfo);
  },
  removeMember(assignmentInfo: SquadLeaderAssignment) {
    return apiV1.delete(`${this.path}/${assignmentInfo.squad_id}/members/${assignmentInfo.leader_id}`);
  },
  updateMemberAssignment(old: SquadLeaderAssignment, new_: SquadLeaderAssignment) {
    return apiV1.patch(`${this.path}/${old.squad_id}/members/${old.leader_id}`, new_);
  },
};

export const squadLeaderServices = {
  path: 'squads-leaders',

  getAssignment(filters: any) {
    const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
    if (query) {
      return apiV1.get(`${this.path}?${query}`);
    }
    return apiV1.get(this.path);
  },
}

export const squadRolesServices = {
  path: 'squad-roles',

  getSquadRoles() {
    return apiV1.get(this.path)
  }
}

export const schoolYearServices = {
  path: API_PATHS.SchoolYear,

  getSchoolYears() {
    return apiV1.get(this.path);
  },
  getSchoolYear(id: number) {
    return apiV1.get(`${this.path}/${id}`);
  },
  createSchoolYear(data: any) {
    return apiV1.post(this.path, data);
  },
  updateSchoolYear(id: number, data: any) {
    return apiV1.patch(`${this.path}/${id}`, data);
  }
};

export const sectorsServices = {
  getSectors() {
    return apiV1.get('/sectors');
  }
};

export const leaderRolesServices = {
  async getLeaderRoles() {
    const roles = await apiV1.get(API_PATHS.LeaderRole);
    if (roles.length) {
      roles.forEach((role: any) => {
        role.longName = processLeaderRole(role.name, role.level);
      });
    }
    return roles;
  }
};

export const leaderServices = {
  path: API_PATHS.Leader,

  getLeaders(filters?: any) {
    if (filters) {
      const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
      return apiV2.get(`${this.path}?${query}`);
    }
    return apiV2.get(this.path);
  },
  addLeader(leader: any) {
    return apiV1.post(this.path, leader);
  },
  updateLeader(leaderId: number, leader: any) {
    return apiV1.patch(`${this.path}/${leaderId}`, leader);
  },
  deleteLeader(leaderId: number) {
    return apiV1.delete(`${this.path}/${leaderId}`);
  },
  getStats() {
    return apiV1.get(`${this.path}/stats?is_active=true`);
  }
};

export const memberServices = {
  path: API_PATHS.Member,

  getMembers(filters?: any) {
    if (filters) {
      const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
      return apiV2.get(`${this.path}?${query}`);
    }
    return apiV2.get(this.path);
  },
  addMember(leader: any) {
    return apiV1.post(this.path, leader);
  },
  updateMember(memberId: string, leader: any) {
    return apiV1.patch(`${this.path}/${memberId}`, leader);
  },
  deleteMember(memberId: string) {
    return apiV1.delete(`${this.path}/${memberId}`);
  },
  getStats() {
    return apiV1.get(`${this.path}/stats?is_active=true`);
  },
  getMemberSquad(memberId: string, filters?: any) {
    let query = '';
    if (filters) {
      query = `?${Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&')}`;
    }
    return apiV1.get(`${this.path}/${memberId}/squads${query}`)
  },
  removeMemberFromSquad(memberId: string, squadId: number) {
    return apiV1.delete(`${this.path}/${memberId}/squads/${squadId}`);
  },
};

export const assignmentServices = {
  path: ''
}


export const authService = {
  path: 'auth',
  
  login(data: any) {
    return apiV1.post(`${this.path}/login`, data, { withCredentials: true });
  },
  getUserInfo() {
    return apiV1.get(`${this.path}/user-info`, { withCredentials: true })
  },
  logout() {
    return apiV1.post(`${this.path}/logout`, {}, { withCredentials: true });
  },
  createUser(data: any) {
    return apiV1.post(`${this.path}/create-user`, data, { withCredentials: true });
  },
  verifySetupToken(token: string) {
    return apiV1.post(`${this.path}/verify-token`, { setupCode: token });
  },
  setupAdmin(data: any) {
    return apiV1.post(`${this.path}/setup`, data);
  }
}
