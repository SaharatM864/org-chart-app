import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { v4 as uuidv4 } from 'uuid';
import { MoveNodePayload, OrgState, PositionItem, WorkerNode } from './org.model';
import { OrgService } from './org.service';

const initialState: OrgState = {
  nodeMap: {},
  rootIds: [],
  sidebarPositions: [
    { id: 'pos-1', name: 'IT Support', code: 'IT01' },
    { id: 'pos-2', name: 'Programmer', code: 'DEV01' },
    { id: 'pos-3', name: 'Manager', code: 'MGR01' },
    { id: 'pos-4', name: 'HR Officer', code: 'HR01' },
    { id: 'pos-5', name: 'Accountant', code: 'ACC01' },
  ],
  isLoading: false,
  error: null,
  highlightedNodeId: null,
};

export const OrgStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    viewTree: computed(() => {
      interface TreeNode extends WorkerNode {
        children: TreeNode[];
      }
      const buildTree = (nodeId: string): TreeNode | null => {
        const node = store.nodeMap()[nodeId];
        if (!node) return null;
        return {
          ...node,
          children: node.childrenIds
            .map((id) => buildTree(id))
            .filter((n): n is TreeNode => n !== null),
        };
      };
      return store
        .rootIds()
        .map((id) => buildTree(id))
        .filter((n): n is TreeNode => n !== null);
    }),
    allDropListIds: computed(() => Object.keys(store.nodeMap())),
    nodesByLevel: computed(() => {
      const map = store.nodeMap();
      const result: Record<number, WorkerNode[]> = {};
      Object.values(map).forEach((node) => {
        if (!result[node.level]) {
          result[node.level] = [];
        }
        result[node.level].push(node);
      });
      return result;
    }),
    highlightedIds: computed(() => {
      const id = store.highlightedNodeId();
      if (!id) return new Map<string, 'current' | 'parent' | 'child'>();

      const map = store.nodeMap();
      const resultMap = new Map<string, 'current' | 'parent' | 'child'>();

      if (!map[id]) return resultMap;

      resultMap.set(id, 'current');

      let curr = map[id];
      while (curr && curr.parentId) {
        resultMap.set(curr.parentId, 'parent');
        curr = map[curr.parentId];
      }

      const addChildren = (nodeId: string) => {
        const node = map[nodeId];
        if (node) {
          node.childrenIds.forEach((childId) => {
            resultMap.set(childId, 'child');
            addChildren(childId);
          });
        }
      };
      addChildren(id);

      return resultMap;
    }),
  })),
  withMethods((store, orgService = inject(OrgService)) => ({
    setHighlight: (nodeId: string | null) => {
      patchState(store, { highlightedNodeId: nodeId });
    },
    loadChart: () => {
      patchState(store, { isLoading: true });
      orgService.getOrgChart().subscribe({
        next: (data) => {
          patchState(store, {
            nodeMap: data.nodeMap || {},
            rootIds: data.rootIds || [],
            isLoading: false,
          });
        },
        error: (err) => patchState(store, { error: err.message, isLoading: false }),
      });
    },

    addNode: (parentId: string | null, position: PositionItem) => {
      const newNodeId = uuidv4();
      const newNode: WorkerNode = {
        id: newNodeId,
        name: position.name,
        nameTh: position.nameTh,
        nameZh: position.nameZh,
        nameVi: position.nameVi,
        parentId,
        childrenIds: [],
        level: parentId ? store.nodeMap()[parentId].level + 1 : 1,
        isExpanded: true,
        section: 'General',
        salaryType: 'Normal',
      };

      patchState(store, (state) => {
        const updatedNodeMap: Record<string, WorkerNode> = {
          ...state.nodeMap,
          [newNodeId]: newNode,
        };
        const updatedRootIds = [...state.rootIds];

        if (parentId) {
          const parent = updatedNodeMap[parentId];
          if (parent) {
            updatedNodeMap[parentId] = {
              ...parent,
              childrenIds: [...parent.childrenIds, newNodeId],
            };
          }
        } else {
          updatedRootIds.push(newNodeId);
        }

        return { nodeMap: updatedNodeMap, rootIds: updatedRootIds };
      });
    },

    moveNode: ({ nodeId, newParentId, newIndex }: MoveNodePayload) => {
      const state = store.nodeMap();
      const node = state[nodeId];
      if (!node) return;

      let currentCheckId: string | null = newParentId;
      while (currentCheckId) {
        if (currentCheckId === nodeId) {
          console.warn('Cannot move node into its own descendant');
          return; // Prevent loop
        }
        currentCheckId = state[currentCheckId]?.parentId || null;
      }

      patchState(store, (currentState) => {
        const updatedNodeMap: Record<string, WorkerNode> = { ...currentState.nodeMap };
        let updatedRootIds = [...currentState.rootIds];
        const oldParentId = node.parentId;

        if (oldParentId) {
          const oldParent = updatedNodeMap[oldParentId];
          if (oldParent) {
            updatedNodeMap[oldParentId] = {
              ...oldParent,
              childrenIds: oldParent.childrenIds.filter((id) => id !== nodeId),
            };
          }
        } else {
          updatedRootIds = updatedRootIds.filter((id) => id !== nodeId);
        }

        const newLevel = newParentId ? updatedNodeMap[newParentId].level + 1 : 1;

        // Recursive function to update levels of children if depth changes
        const updateChildrenLevels = (id: string, startLevel: number) => {
          const child = updatedNodeMap[id];
          if (child) {
            updatedNodeMap[id] = { ...child, level: startLevel };
            child.childrenIds.forEach((cid) => updateChildrenLevels(cid, startLevel + 1));
          }
        };

        updatedNodeMap[nodeId] = {
          ...node,
          parentId: newParentId,
          level: newLevel,
        };
        // If level changed, sync children
        if (node.level !== newLevel) {
          node.childrenIds.forEach((cid) => updateChildrenLevels(cid, newLevel + 1));
        }

        if (newParentId) {
          const newParent = updatedNodeMap[newParentId];
          const newChildren = [...newParent.childrenIds];
          newChildren.splice(newIndex, 0, nodeId);
          updatedNodeMap[newParentId] = {
            ...newParent,
            childrenIds: newChildren,
          };
        } else {
          updatedRootIds.splice(newIndex, 0, nodeId);
        }

        return { nodeMap: updatedNodeMap, rootIds: updatedRootIds };
      });
    },

    updateNode: (nodeId: string, changes: Partial<WorkerNode>) => {
      patchState(store, (state) => {
        const node = state.nodeMap[nodeId];
        if (!node) return state;
        const updatedNode = { ...node, ...changes };
        return {
          nodeMap: { ...state.nodeMap, [nodeId]: updatedNode },
        };
      });
    },

    deleteNode: (nodeId: string, promoteChildren: boolean) => {
      patchState(store, (state) => {
        const node = state.nodeMap[nodeId];
        if (!node) return state;

        const parentId = node.parentId;
        const updatedNodeMap: Record<string, WorkerNode> = { ...state.nodeMap };
        let updatedRootIds: string[] = [...state.rootIds];

        delete updatedNodeMap[nodeId];

        if (parentId) {
          const parent = updatedNodeMap[parentId];
          updatedNodeMap[parentId] = {
            ...parent,
            childrenIds: parent.childrenIds.filter((id) => id !== nodeId),
          };
        } else {
          updatedRootIds = updatedRootIds.filter((id) => id !== nodeId);
        }

        if (!promoteChildren) {
          const deleteChildren = (id: string) => {
            const child = state.nodeMap[id];
            if (child) {
              child.childrenIds.forEach(deleteChildren);
              delete updatedNodeMap[id];
            }
          };
          node.childrenIds.forEach(deleteChildren);
        } else {
          // Promote children to parent
          node.childrenIds.forEach((childId) => {
            const child = updatedNodeMap[childId];
            if (child) {
              updatedNodeMap[childId] = {
                ...child,
                parentId: parentId,
                level: parentId ? updatedNodeMap[parentId].level + 1 : 1,
              };

              if (parentId) {
                updatedNodeMap[parentId].childrenIds.push(childId);
              } else {
                updatedRootIds.push(childId);
              }
            }
          });
        }

        return { nodeMap: updatedNodeMap, rootIds: updatedRootIds };
      });
    },

    addSidebarPosition: (position: Omit<PositionItem, 'id' | 'code'> & { code?: string }) => {
      const newPos: PositionItem = {
        id: uuidv4(),
        name: position.name,
        nameTh: position.nameTh,
        nameZh: position.nameZh,
        nameVi: position.nameVi,
        code: position.code || `POS-${Math.floor(Math.random() * 1000)}`,
      };
      patchState(store, (state) => ({
        sidebarPositions: [...state.sidebarPositions, newPos],
      }));
    },

    updateSidebarPosition: (id: string, position: Partial<PositionItem>) => {
      patchState(store, (state) => ({
        sidebarPositions: state.sidebarPositions.map((p) =>
          p.id === id ? { ...p, ...position } : p,
        ),
      }));
    },

    reorderSidebarPositions: (previousIndex: number, currentIndex: number) => {
      patchState(store, (state) => {
        const positions = [...state.sidebarPositions];
        const [movedItem] = positions.splice(previousIndex, 1);
        positions.splice(currentIndex, 0, movedItem);
        return { sidebarPositions: positions };
      });
    },

    generateRandomChart: () => {
      patchState(store, (state) => {
        const positions = state.sidebarPositions;
        if (positions.length === 0) return state;

        const nodeMap: Record<string, WorkerNode> = {};
        const rootIds: string[] = [];

        // 1. Create Root Node
        const rootId = uuidv4();
        const rootPos = positions[Math.floor(Math.random() * positions.length)];

        nodeMap[rootId] = {
          id: rootId,
          name: rootPos.name,
          nameTh: rootPos.nameTh,
          nameZh: rootPos.nameZh,
          nameVi: rootPos.nameVi,
          parentId: null,
          childrenIds: [],
          level: 1,
          isExpanded: true,
          section: rootPos.code || 'General',
          salaryType: 'Normal',
        };
        rootIds.push(rootId);

        // 2. Generate Random Nodes (Total 20-100)
        const totalNodes = Math.floor(Math.random() * 81) + 20; // 20 to 100
        const allNodeIds = [rootId];

        for (let i = 0; i < totalNodes - 1; i++) {
          const newId = uuidv4();
          const randomPos = positions[Math.floor(Math.random() * positions.length)];

          // Pick a random parent from existing nodes
          const parentId = allNodeIds[Math.floor(Math.random() * allNodeIds.length)];
          const parent = nodeMap[parentId];

          const newNode: WorkerNode = {
            id: newId,
            name: randomPos.name,
            nameTh: randomPos.nameTh,
            nameZh: randomPos.nameZh,
            nameVi: randomPos.nameVi,
            parentId: parentId,
            childrenIds: [],
            level: parent.level + 1,
            isExpanded: true,
            section: randomPos.code || 'General',
            salaryType: 'Normal',
          };

          nodeMap[newId] = newNode;
          nodeMap[parentId] = {
            ...parent,
            childrenIds: [...parent.childrenIds, newId],
          };
          allNodeIds.push(newId);
        }

        return { nodeMap, rootIds };
      });
    },
  })),
);
