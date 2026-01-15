export type SalaryType = 'Normal' | 'Admin' | 'Management';

export interface WorkerNode {
  id: string;
  name: string;
  nameTh?: string;
  nameZh?: string;
  nameVi?: string;
  section?: string;
  salaryType?: SalaryType;
  parentId: string | null;
  childrenIds: string[];
  level: number;
  isExpanded: boolean;
}

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
