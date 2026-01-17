import { PositionItem, WorkerNode } from './org.model';
import { v4 as uuidv4 } from 'uuid';

export class OrgLogicHelper {
  static generateRandomChart(
    positions: PositionItem[],
    count = 100,
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
    // Track max children for each node to create a diverse but deep tree
    const maxChildrenMap: Record<string, number> = {};
    maxChildrenMap[rootId] = Math.floor(Math.random() * 3) + 1; // 1-3 children for root

    // 2. Generate Random Nodes
    // Start from 1 because we already created the root
    for (let i = 1; i < count; i++) {
      // Pick a random parent from existing nodes
      const parentIndex = Math.floor(Math.random() * existingIds.length);
      const parentId = existingIds[parentIndex];
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
      // Assign random max children for this new node (1-3) to keep it deep
      maxChildrenMap[newNodeId] = Math.floor(Math.random() * 3) + 1;

      // Update parent
      const updatedChildren = [...parent.childrenIds, newNodeId];
      nodeMap[parentId] = {
        ...parent,
        childrenIds: updatedChildren,
      };

      // If parent reached its max children, remove from pool to force depth
      if (updatedChildren.length >= (maxChildrenMap[parentId] || 2)) {
        existingIds.splice(parentIndex, 1);
      }
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
