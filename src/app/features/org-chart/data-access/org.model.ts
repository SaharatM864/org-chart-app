import { EmployeeNode, SalaryType } from '../../../core/models/employee.model';

export type { SalaryType };
export type WorkerNode = EmployeeNode;

export interface PositionItem {
  id: string;
  name: string;
  nameTh?: string;
  nameZh?: string;
  nameVi?: string;
  code: string;
}

export interface OrgState {
  nodeMap: Record<string, WorkerNode>;
  rootIds: string[];
  sidebarPositions: PositionItem[];
  isLoading: boolean;
  error: string | null;
  highlightedNodeId: string | null;
}

export interface MoveNodePayload {
  nodeId: string;
  newParentId: string | null;
  newIndex: number;
}

export interface PositionFormData {
  name: string;
  nameTh: string;
  nameZh: string;
  nameVi: string;
  section: string;
  salaryType: string;
}
