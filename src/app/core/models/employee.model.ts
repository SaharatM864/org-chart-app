export type SalaryType = 'Normal' | 'Admin' | 'Management';

export interface Employee {
  id: string;
  name: string;
  nameTh?: string;
  nameZh?: string;
  nameVi?: string;
  section?: string;
  salaryType?: SalaryType;
  position?: string;
  email?: string;
  avatarUrl?: string;
}

// Extending Employee for the Org Chart specifics (graph structure)
export interface EmployeeNode extends Employee {
  parentId: string | null;
  childrenIds: string[];
  level: number;
  isExpanded: boolean;
}
