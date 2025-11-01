import { API_PATHS, type SquadLeaderAssignment, type SquadMemberAssignment } from '@/constants';
import http from './http.service';
import { processLeaderRole } from '@/utils/common';

export const saintServices = {
  path: API_PATHS.Saint,

  get() {
    return http.get(this.path)
  }
}

export const squadServices = {
  path: API_PATHS.Squad,

  getSquads(filters: any) {
    const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
    if (query) {
      return http.get(`${this.path}?${query}`);
    }
    return http.get(this.path);
  },
  getSquad(squadId: number, includeLeaders = false) {
    const query = includeLeaders ? '?include=leaders' : '';
    return http.get(`${this.path}/${squadId}${query}`);
  },
  createSquad(squad: any) {
    return http.post(this.path, squad);
  },
  updateSquad(squadId: number, squad: any) {
    return http.patch(`${this.path}/${squadId}`, squad);
  },
  deleteSquad(squadId: number) {
    return http.delete(`${this.path}/${squadId}`);
  },
  getLeadersAssignment(squadId: number) {
    return http.get(`${this.path}/${squadId}/leaders`);
  },
  assignLeader(assignmentInfo: SquadLeaderAssignment) {
    return http.post(`${this.path}/${assignmentInfo.squad_id}/leaders`, assignmentInfo);
  },
  unassignLeader(assignmentInfo: SquadLeaderAssignment) {
    return http.delete(`${this.path}/${assignmentInfo.squad_id}/leaders/${assignmentInfo.leader_id}`);
  },
  updateAssignment(old: SquadLeaderAssignment, new_: SquadLeaderAssignment) {
    return http.patch(`${this.path}/${old.squad_id}/leaders/${old.leader_id}`, new_);
  },
  getMembers(squadId: number) {
    return http.get(`${this.path}/${squadId}/members?detailsBy=member_id`);
  },
  addMember(assignmentInfo: SquadMemberAssignment) {
    return http.post(`${this.path}/${assignmentInfo.squad_id}/members`, assignmentInfo);
  },
  removeMember(assignmentInfo: SquadLeaderAssignment) {
    return http.delete(`${this.path}/${assignmentInfo.squad_id}/members/${assignmentInfo.leader_id}`);
  },
  updateMemberAssignment(old: SquadLeaderAssignment, new_: SquadLeaderAssignment) {
    return http.patch(`${this.path}/${old.squad_id}/members/${old.leader_id}`, new_);
  },
};

export const squadLeaderServices = {
  path: 'squads-leaders',

  getAssignment(filters: any) {
    const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
    if (query) {
      return http.get(`${this.path}?${query}`);
    }
    return http.get(this.path);
  },
}

export const squadRolesServices = {
  path: 'squad-roles',

  getSquadRoles() {
    return http.get(this.path)
  }
}

export const schoolYearServices = {
  path: API_PATHS.SchoolYear,

  getSchoolYears() {
    return http.get(this.path);
  },
  getSchoolYear(id: number) {
    return http.get(`${this.path}/${id}`);
  }
};

export const sectorsServices = {
  getSectors() {
    return http.get('/sectors');
  }
};

export const leaderRolesServices = {
  async getLeaderRoles() {
    const roles = await http.get(API_PATHS.LeaderRole);
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
      return http.get(`${this.path}?${query}`);
    }
    return http.get(this.path);
  },
  addLeader(leader: any) {
    return http.post(this.path, leader);
  },
  updateLeader(leaderId: number, leader: any) {
    return http.patch(`${this.path}/${leaderId}`, leader);
  },
  deleteLeader(leaderId: number) {
    return http.delete(`${this.path}/${leaderId}`);
  }
};

export const memberServices = {
  path: API_PATHS.Member,

  getMembers(filters?: any) {
    if (filters) {
      const query = Object.entries(filters).map(f => `${f[0]}=${f[1]}`).join('&');
      return http.get(`${this.path}?${query}`);
    }
    return http.get(this.path);
  },
  addMember(leader: any) {
    return http.post(this.path, leader);
  },
  updateMember(memberId: number, leader: any) {
    return http.patch(`${this.path}/${memberId}`, leader);
  },
  deleteMember(memberId: number) {
    return http.delete(`${this.path}/${memberId}`);
  }
};

export const assignmentServices = {
  path: ''
}


export const authService = {
  path: 'auth',
  
  login(data: any) {
    return http.post(`${this.path}/login`, data, { withCredentials: true });
  },
  getUserInfo() {
    return http.get(`${this.path}/user-info`, { withCredentials: true })
  },
  logout() {
    return http.post(`${this.path}/logout`, {}, { withCredentials: true });
  },
  verifySetupToken(token: string) {
    return http.post(`${this.path}/verify-token`, { setupCode: token });
  },
  setupAdmin(data: any) {
    return http.post(`${this.path}/setup`, data);
  }
}
