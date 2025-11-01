
// const VITE_WMS_URL='https://wms-api.flashfulfillment.vn'

// const OA_SIGN_KEY = 'OA-Sign',
//   SESSION_ID_KEY = 'sessionId',
//   API_VERSION = '1.0';

// export { VITE_WMS_URL, OA_SIGN_KEY, SESSION_ID_KEY, API_VERSION }

export const dateFormat = 'dd/mm/yy';

export const sectorImgs = ['chien', 'au', 'thieu', 'nghia', 'hiep'];
export const roleImgs = ['dutruong', 'huynhtruong', 'trota', 'trouy', 'tuyenuy', 'huanluyenvien'];

/**
 * Interfaces
 */

export interface Option {
  label: string;
  value: string | number;
}

// Data table
export interface TableCol {
  field: string;
  header: string;
  useTemplate?: boolean;
  templateName?: string;
  editable?: boolean;
  type?: TblColType;
  filterMatchMode?: string;
  filterEnabled?: boolean;
  selectCfg?: {
    options: any[];
    labelProp?: string;
    valueProp?: string;
    optionTemplateName?: string;
    valueTemplateName?: string;
  };
  useLink?: boolean;
  basePath?: string;
}
export interface TableActions {
  icon: string;
  label?: string;
  tooltip?: string;
  action: (event: any, index: number) => void;
}

// Forms
export interface FormField {
  type: FormFieldType;
  name: string;
  label: string;
  
  inputType?: string;
  validation?: boolean;
  invalid?: boolean;

}

// APIs
export interface SquadLeaderAssignment {
  squad_id: number;
  leader_id: string;
  role: number;
}
export interface SquadMemberAssignment {
  squad_id: number;
  member_id: string;
}


/**
 * Enum
 */

export enum TblColType {
  Text,
  Select,
  Date,
}

export enum FormFieldType {
  Input,
  Select,
  MultiSelect,
  Checkbox,
  DatePicker,
}

export enum API_TYPES {
  Saint,
  Squad,
  Sector,
  Leader,
  Member,
};

export const API_PATHS = {
  Saint: 'saints',
  SchoolYear: 'school-years',
  Squad: 'squads',
  Sector: 'sectors',
  Member: 'youth-members',
  Leader: 'youth-leaders',
  LeaderRole: 'leader-roles',
};

export const DB_CODES = {
  SQUAD_PRESIDENT: 'chi_doan_truong',
  SQUAD_VICE: 'chi_doan_pho',
}