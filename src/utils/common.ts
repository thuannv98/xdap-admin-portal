import { roleImgs, sectorImgs } from "@/constants";
import leaderIcon from '@/assets/imgs/leader.jpeg'

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
