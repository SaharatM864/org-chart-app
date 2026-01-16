import { WorkerNode } from '../data-access/org.model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OrgChartNode } from 'ngx-interactive-org-chart';

export function transformToOrgChartNode(
  nodeMap: Record<string, WorkerNode>,
  rootIds: string[],
): OrgChartNode[] {
  if (!rootIds || rootIds.length === 0) {
    return [];
  }

  return rootIds
    .map((rootId: string) => buildNode(rootId, nodeMap))
    .filter((node): node is OrgChartNode => node !== null);
}

function buildNode(nodeId: string, nodeMap: Record<string, WorkerNode>): OrgChartNode | null {
  const node = nodeMap[nodeId];
  if (!node) {
    return null;
  }

  const children: OrgChartNode[] = (node.childrenIds || [])
    .map((childId: string) => buildNode(childId, nodeMap))
    .filter((child: OrgChartNode | null): child is OrgChartNode => child !== null);

  return {
    id: node.id,
    name: node.name,

    data: node,
    children: children,
  };
}
