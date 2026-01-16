import { PositionItem, WorkerNode } from './org.model';
import { v4 as uuidv4 } from 'uuid';

export class OrgLogicHelper {
  static generateRandomChart(
    positions: PositionItem[],
    count = 20,
  ): { nodeMap: Record<string, WorkerNode>; rootIds: string[] } {
    if (positions.length === 0) {
      return { nodeMap: {}, rootIds: [] };
    }

    const nodeMap: Record<string, WorkerNode> = {};
    const rootIds: string[] = [];

    // 1. Create Root
    const rootPos = positions[Math.floor(Math.random() * positions.length)];
    const rootId = uuidv4();
    const rootNode: WorkerNode = {
      id: rootId,
      name: rootPos.name,
      nameTh: rootPos.nameTh,
      nameZh: rootPos.nameZh,
      nameVi: rootPos.nameVi,
      parentId: null,
      childrenIds: [],
      level: 1,
      isExpanded: true,
      section: rootPos.code,
      salaryType: 'Normal',
    };

    nodeMap[rootId] = rootNode;
    rootIds.push(rootId);

    const existingIds = [rootId];

    // 2. Generate Random Nodes
    // Ensure we don't exceed 100 total nodes (including root)
    const targetCount = Math.min(Math.max(count, 20), 100);

    for (let i = 1; i < targetCount; i++) {
      const parentId = existingIds[Math.floor(Math.random() * existingIds.length)];
      const parent = nodeMap[parentId];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      const newNodeId = uuidv4();

      const newNode: WorkerNode = {
        id: newNodeId,
        name: pos.name,
        nameTh: pos.nameTh,
        nameZh: pos.nameZh,
        nameVi: pos.nameVi,
        parentId: parentId,
        childrenIds: [],
        level: parent.level + 1,
        isExpanded: true,
        section: pos.code,
        salaryType: 'Normal',
      };

      nodeMap[newNodeId] = newNode;
      existingIds.push(newNodeId);

      // Update parent
      nodeMap[parentId] = {
        ...parent,
        childrenIds: [...parent.childrenIds, newNodeId],
      };
    }

    return { nodeMap, rootIds };
  }

  static moveNode(
    nodeId: string,
    newParentId: string,
    currentMap: Record<string, WorkerNode>,
  ): Record<string, WorkerNode> | null {
    const node = currentMap[nodeId];
    const newParent = currentMap[newParentId];

    if (!node || !newParent) return null;
    if (node.parentId === newParentId) return null; // No change

    // Cycle detection
    let curr: WorkerNode | undefined = newParent;
    while (curr) {
      if (curr.id === nodeId) {
        console.warn('Cannot move node into its own descendant');
        return null;
      }
      curr = curr.parentId ? currentMap[curr.parentId] : undefined;
    }

    const updatedMap = { ...currentMap };

    // 1. Remove from old parent
    if (node.parentId) {
      const oldParent = updatedMap[node.parentId];
      if (oldParent) {
        updatedMap[node.parentId] = {
          ...oldParent,
          childrenIds: oldParent.childrenIds.filter((id) => id !== nodeId),
        };
      }
    }

    // 2. Add to new parent
    updatedMap[newParentId] = {
      ...newParent,
      childrenIds: [...newParent.childrenIds, nodeId],
    };

    // 3. Update node itself
    updatedMap[nodeId] = {
      ...node,
      parentId: newParentId,
      level: newParent.level + 1,
    };

    // 4. Recursively update children levels
    OrgLogicHelper.updateChildrenLevels(nodeId, updatedMap[nodeId].level, updatedMap);

    return updatedMap;
  }

  private static updateChildrenLevels(
    parentId: string,
    parentLevel: number,
    map: Record<string, WorkerNode>,
  ) {
    const parent = map[parentId];
    if (!parent) return;

    parent.childrenIds.forEach((childId) => {
      const child = map[childId];
      if (child) {
        map[childId] = {
          ...child,
          level: parentLevel + 1,
        };
        OrgLogicHelper.updateChildrenLevels(childId, parentLevel + 1, map);
      }
    });
  }
}
