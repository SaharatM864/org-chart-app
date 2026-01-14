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
};

export const OrgStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    viewTree: computed(() => {
      const buildTree = (nodeId: string): any => {
        const node = store.nodeMap()[nodeId];
        if (!node) return null;
        return {
          ...node,
          children: node.childrenIds.map((id) => buildTree(id)).filter((n) => n !== null),
        };
      };
      return store
        .rootIds()
        .map((id) => buildTree(id))
        .filter((n) => n !== null);
    }),
    allDropListIds: computed(() => Object.keys(store.nodeMap())),
  })),
  withMethods((store, orgService = inject(OrgService)) => ({
    loadChart: () => {
      patchState(store, { isLoading: true });
      orgService.getOrgChart().subscribe({
        next: (data) => {
          patchState(store, {
            nodeMap: data.nodeMap,
            rootIds: data.rootIds,
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
        let updatedRootIds = [...state.rootIds];

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

      // 1. Circular Dependency Check: Cannot move node into its own descendant
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

        // 2. Remove from old location
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

        // 3. Update Node Data (Parent & Level)
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

        // 4. Insert into new location
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

    deleteNode: (nodeId: string, promoteChildren: boolean) => {
      patchState(store, (state) => {
        const node = state.nodeMap[nodeId];
        if (!node) return state;

        const parentId = node.parentId;
        const updatedNodeMap: Record<string, WorkerNode> = { ...state.nodeMap };
        let updatedRootIds: string[] = [...state.rootIds];

        // Remove node from map
        delete updatedNodeMap[nodeId];

        // Remove reference from parent
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
          // Delete children recursively
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
  })),
);
