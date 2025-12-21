import { roleImgs, sectorImgs } from "@/constants";
import leaderIcon from '@/assets/imgs/leader.jpeg'
import { useLeaderRolesStore } from "@/stores/apis";

export const normalize = (str: string) => str.normalize("NFD") // separate accents
  .replace(/[\u0300-\u036f]/g, "")  // remove accents
  .replace(/\s+/g, "").toLowerCase();

export const getShortName = (firstName: string, lastName: string): string => {
  const shortFname = firstName.split(' ').map(w => w[0]).join('.');
  return `${shortFname}.${lastName}`;
};

export const processLeaderRole = (roleName: string, level?: number) => level ? `${roleName} cấp ${level}` : roleName;

export const getRoleImg = (roles: any[], value: string, key = 'name') => {
  let role = getRole(roles, value, key)?.name || '';
  role = roleImgs.find(i => normalize(role) == i) || '';
  return role ? new URL(`../assets/imgs/${role}.png`, import.meta.url).href : undefined;
}

/**
 * Get the role object by key-value role property
 * @param roles list of roles object
 * @param value property value to identify the role object
 * @param key property used to identify the role object. Default to 'name'
 * @returns role object
 */
export const getRole = (roles: any[], value: string, key = 'name') => {
  return roles.find(r => r[key] == value);
}

export function getSectorImg(sectorCode: string) {
  const sector = sectorImgs.find(sector => normalize(sector).includes(sectorCode));
  return sector ? new URL(`/src/assets/imgs/${sector}.png`, import.meta.url).href : null;
};

export const getLeaderFullName = (leader: any) => {
  if (!leader) return '';
  return `${leader.baptism_name} ${leader.first_name} ${leader.last_name}`;
}

export const getLeaderAvatar = (leader: any) => leader?.avatar || leaderIcon;

export const getFirstLettersOfWords = (str: string) => {
  if (!str) return '';

  const words = str.trim().split(/\s+/); 

  const firstLetters = words.map(word => word.charAt(0));

  return firstLetters.join('');
}

export const preProcessDateInput = (val: any) => {
  if (val === '' || val === null) {
    return null;
  }
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === 'string') {
    const [day, month, year] = val.split('/').map(v => Number(v));
    if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12 || year < 1000 || year > 9999) {
      return undefined;
    }
    const date = new Date(+year, +month - 1, +day);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date;
  }
  return undefined;
};

export const displayDate = (date: string | Date) => {
  if (date) {
    return new Date(date).toLocaleDateString('vi-VN');
  } else {
    return null;
  }
};
