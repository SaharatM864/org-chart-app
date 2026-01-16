import { Component, computed, inject, ViewChild, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { OrgStore } from '../../data-access/org.store';
import { AddPositionDialogComponent } from '../../ui/dialogs/add-position-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../ui/dialogs/confirm-delete-dialog.component';
import { NodeCardComponent } from '../../ui/node-card/node-card.component';
import { ChartViewSkeletonComponent } from '../../ui/chart-view-skeleton/chart-view-skeleton.component';
import { PositionSidebarSkeletonComponent } from '../../ui/position-sidebar-skeleton/position-sidebar-skeleton.component';
import { EditNodeDialogComponent } from '../../ui/dialogs/edit-node-dialog.component';
import { transformToOrgChartNode } from '../../utils/org-chart-adapter';
import { HlmDialog } from '@spartan-ng/helm/dialog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  NgxInteractiveOrgChart,
  OrgChartNode,
  NgxInteractiveOrgChartTheme,
} from 'ngx-interactive-org-chart';
import { PositionFormData, PositionItem, WorkerNode } from '../../data-access/org.model';
import { SelectParentDialogComponent } from '../../ui/dialogs/select-parent-dialog.component';
import { ChartToolbarComponent } from '../../ui/chart-toolbar/chart-toolbar.component';
import { PositionSidebarComponent } from '../../ui/position-sidebar/position-sidebar.component';
import { EditPositionDialogComponent } from '../../ui/dialogs/edit-position-dialog.component';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    NodeCardComponent,
    NgxInteractiveOrgChart,
    BrnDialogContent,
    HlmDialog,
    AddPositionDialogComponent,
    EditPositionDialogComponent,
    EditNodeDialogComponent,
    SelectParentDialogComponent,
    ConfirmDeleteDialogComponent,
    ChartToolbarComponent,
    PositionSidebarComponent,
    ChartViewSkeletonComponent,
    PositionSidebarSkeletonComponent,
  ],
  template: `
    <div class="flex h-full w-full bg-background text-foreground" cdkDropListGroup>
      <app-position-sidebar-skeleton *ngIf="store.isLoading(); else sidebar" />
      <ng-template #sidebar>
        <app-position-sidebar
          [positions]="store.sidebarPositions()"
          (addPosition)="openAddPositionDialog()"
          (editPosition)="openEditPositionDialog($event)"
          (reorder)="onSidebarReorder($event)"
        ></app-position-sidebar>
      </ng-template>

      <main
        class="figma-bg-dots relative flex-1 overflow-hidden"
        style="--chart-bg: #f5f5f5;"
        id="main-drop-zone"
        cdkDropList
        (cdkDropListDropped)="onBackgroundDrop($event)"
      >
        <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <app-chart-toolbar
            [isDraggable]="isDraggable"
            [showMiniMap]="showMiniMap"
            [layoutDirection]="layoutDirection"
            (zoomIn)="zoomIn()"
            (zoomOut)="zoomOut()"
            (resetView)="resetView()"
            (toggleDragAndDrop)="toggleDragAndDrop()"
            (switchLayout)="switchLayout()"
            (toggleMiniMap)="toggleMiniMap()"
            (expandAll)="expandAll()"
            (collapseAll)="collapseAll()"
          ></app-chart-toolbar>
        </div>

        <app-chart-view-skeleton *ngIf="store.isLoading(); else content" />

        <ng-template #content>
          <ng-container *ngIf="chartData() as rootNode; else noData">
            <ngx-interactive-org-chart
              #orgChart
              class="block h-full w-full"
              [data]="rootNode"
              [themeOptions]="themeOptions"
              [draggable]="isDraggable"
              [layout]="layoutDirection"
              [showMiniMap]="showMiniMap"
              miniMapPosition="bottom-right"
              [canDragNode]="canDragNode"
              [canDropNode]="canDropNode"
              (nodeDrop)="onNodeDrop($event)"
            >
              <ng-template #nodeTemplate let-node>
                <app-node-card
                  [node]="node.data"
                  [highlightType]="store.highlightedIds().get(node.id) || null"
                  (delete)="onDeleteNode($event)"
                  (edit)="onEditNode($event)"
                  (highlight)="store.setHighlight($event)"
                  (unhighlight)="store.setHighlight(null)"
                >
                </app-node-card>
              </ng-template>
            </ngx-interactive-org-chart>
          </ng-container>

          <ng-template #noData>
            <div class="flex h-full w-full items-center justify-center text-muted-foreground">
              <div class="text-center">
                <p class="text-lg font-medium">No Organization Data</p>
                <p class="text-sm">Create a root node or import data to get started.</p>
              </div>
            </div>
          </ng-template>
        </ng-template>
      </main>

      <div
        *ngIf="deleteDialogState.isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="relative w-full sm:max-w-md">
          <app-confirm-delete-dialog
            [context]="{
              hasChildren: deleteDialogState.hasChildren,
              childrenCount: deleteDialogState.childrenCount,
            }"
            (onAction)="onDeleteAction($event)"
          ></app-confirm-delete-dialog>
        </div>
      </div>
    </div>

    <hlm-dialog [state]="addDialogState" (closed)="closeAddPositionDialog()">
      <app-add-position-dialog
        *brnDialogContent="let ctx"
        (formSubmit)="onAddPositionSubmit($event)"
        (cancel)="closeAddPositionDialog()"
      >
      </app-add-position-dialog>
    </hlm-dialog>

    <hlm-dialog [state]="editDialogState" (closed)="closeEditPositionDialog()">
      <app-edit-position-dialog
        *brnDialogContent="let ctx"
        [item]="selectedPositionItem!"
        (formSubmit)="onEditPositionSubmit($event)"
        (cancel)="closeEditPositionDialog()"
      >
      </app-edit-position-dialog>
    </hlm-dialog>

    <hlm-dialog [state]="editNodeDialogState" (closed)="closeEditNodeDialog()">
      <app-edit-node-dialog
        *brnDialogContent="let ctx"
        [node]="selectedNode!"
        (formSubmit)="onEditNodeSubmit($event)"
        (cancel)="closeEditNodeDialog()"
      >
      </app-edit-node-dialog>
    </hlm-dialog>

    <hlm-dialog [state]="selectParentDialogState" (closed)="closeSelectParentDialog()">
      <app-select-parent-dialog
        *brnDialogContent="let ctx"
        [candidates]="parentCandidates"
        (parentSelected)="onParentSelected($event)"
        (cancel)="closeSelectParentDialog()"
      >
      </app-select-parent-dialog>
    </hlm-dialog>
  `,
})
export class ChartViewComponent {
  readonly store = inject(OrgStore);
  private readonly _elementRef = inject(ElementRef);

  addDialogState: 'open' | 'closed' = 'closed';
  editDialogState: 'open' | 'closed' = 'closed';
  editNodeDialogState: 'open' | 'closed' = 'closed';
  selectParentDialogState: 'open' | 'closed' = 'closed';

  deleteDialogState = {
    isOpen: false,
    nodeId: null as string | null,
    hasChildren: false,
    childrenCount: 0,
  };

  selectedPositionItem: PositionItem | null = null;
  selectedNode: WorkerNode | null = null;
  parentCandidates: WorkerNode[] = [];
  pendingDropPosition: PositionItem | null = null;

  @ViewChild('orgChart') orgChart?: NgxInteractiveOrgChart<OrgChartNode>;

  constructor() {
    effect(() => {
      const map = this.store.highlightedIds();
      // Cleanup old highlights
      const oldLines = this._elementRef.nativeElement.querySelectorAll(
        '.connector-highlight, .connector-highlight-parent, .connector-highlight-child',
      );
      oldLines.forEach((line: SVGElement) => {
        line.classList.remove(
          'connector-highlight',
          'connector-highlight-parent',
          'connector-highlight-child',
        );
      });

      if (map.size === 0) return;
    });
  }

  chartData = computed(() => {
    const nodes = transformToOrgChartNode(this.store.nodeMap(), this.store.rootIds());
    return nodes.length > 0 ? nodes[0] : null;
  });

  themeOptions: NgxInteractiveOrgChartTheme = {
    node: {
      background: 'transparent',
      shadow: 'none',
      borderRadius: '0',
      outlineColor: 'transparent',
      padding: '0',
    },
    connector: {
      color: '#e2e8f0',
      activeColor: '#3b82f6',
    },
  };

  layoutDirection: 'vertical' | 'horizontal' = 'vertical';
  showMiniMap = false;
  isDraggable = true;

  ngOnInit() {
    this.store.loadChart();
  }

  canDragNode = () => true;
  canDropNode = () => true;

  onNodeDrop(event: { draggedNode: OrgChartNode; targetNode: OrgChartNode }) {
    if (event.draggedNode?.id && event.targetNode?.id) {
      this.store.moveNode({
        nodeId: event.draggedNode.id,
        newParentId: event.targetNode.id,
        newIndex: 0,
      });
    }
  }

  openAddPositionDialog() {
    this.addDialogState = 'open';
  }

  closeAddPositionDialog() {
    this.addDialogState = 'closed';
  }

  onAddPositionSubmit(result: PositionFormData) {
    this.store.addSidebarPosition({
      name: result.name,
      nameTh: result.nameTh,
      nameZh: result.nameZh,
      nameVi: result.nameVi,
      code: result.section,
    });
    this.closeAddPositionDialog();
  }

  openEditPositionDialog(item: PositionItem) {
    this.selectedPositionItem = item;
    this.editDialogState = 'open';
  }

  closeEditPositionDialog() {
    this.editDialogState = 'closed';
    this.selectedPositionItem = null;
  }

  onEditPositionSubmit(result: PositionFormData) {
    if (this.selectedPositionItem) {
      this.store.updateSidebarPosition(this.selectedPositionItem.id, {
        name: result.name,
        nameTh: result.nameTh,
        nameZh: result.nameZh,
        nameVi: result.nameVi,
        code: result.section,
      });
    }
    this.closeEditPositionDialog();
  }

  onSidebarReorder(event: { previousIndex: number; currentIndex: number }) {
    this.store.reorderSidebarPositions(event.previousIndex, event.currentIndex);
  }

  onBackgroundDrop(event: CdkDragDrop<PositionItem[]>) {
    const item = event.item.data as PositionItem;
    if (!item) return;

    const { x, y } = event.dropPoint;
    const element = document.elementFromPoint(x, y);
    const nodeElement = element?.closest('[data-node-id]');

    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-node-id');
      if (nodeId) {
        console.log('Hit Test Detection: Dropped on Node', nodeId);
        this.store.addNode(nodeId, item);
        return;
      }
    }

    const allNodes = Object.values(this.store.nodeMap());

    if (allNodes.length === 0) {
      this.store.addNode(null, item);
    } else {
      this.parentCandidates = allNodes;
      this.pendingDropPosition = item;
      this.selectParentDialogState = 'open';
    }
  }

  closeSelectParentDialog() {
    this.selectParentDialogState = 'closed';
    this.parentCandidates = [];
    this.pendingDropPosition = null;
  }

  onParentSelected(parentId: string) {
    if (this.pendingDropPosition && parentId) {
      this.store.addNode(parentId, this.pendingDropPosition);
    }
    this.closeSelectParentDialog();
  }

  onDeleteNode(nodeId: string) {
    const node = this.store.nodeMap()[nodeId];
    if (!node) return;

    this.deleteDialogState = {
      isOpen: true,
      nodeId: nodeId,
      hasChildren: node.childrenIds.length > 0,
      childrenCount: node.childrenIds.length,
    };
  }

  onDeleteAction(action: 'delete' | 'cascade' | 'reparent' | null) {
    const nodeId = this.deleteDialogState.nodeId;

    if (action && nodeId) {
      if (action === 'delete') {
        this.store.deleteNode(nodeId, false);
      } else if (action === 'cascade') {
        this.store.deleteNode(nodeId, false);
      } else if (action === 'reparent') {
        this.store.deleteNode(nodeId, true);
      }
    }

    this.deleteDialogState = {
      isOpen: false,
      nodeId: null,
      hasChildren: false,
      childrenCount: 0,
    };
  }

  resetView() {
    if (this.orgChart) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.orgChart as any).resetPanAndZoom();
    }
  }

  zoomIn() {
    if (this.orgChart) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.orgChart as any).zoomIn();
    }
  }

  zoomOut() {
    if (this.orgChart) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.orgChart as any).zoomOut();
    }
  }

  switchLayout() {
    this.layoutDirection = this.layoutDirection === 'vertical' ? 'horizontal' : 'vertical';
  }

  toggleMiniMap() {
    this.showMiniMap = !this.showMiniMap;
  }

  expandAll() {
    if (this.orgChart) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.orgChart as any).toggleCollapseAll(false);
    }
  }

  collapseAll() {
    if (this.orgChart) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.orgChart as any).toggleCollapseAll(true);
    }
  }

  toggleDragAndDrop() {
    this.isDraggable = !this.isDraggable;
  }

  onEditNode(nodeId: string) {
    const node = this.store.nodeMap()[nodeId];
    if (node) {
      this.selectedNode = node;
      this.editNodeDialogState = 'open';
    }
  }

  closeEditNodeDialog() {
    this.editNodeDialogState = 'closed';
    this.selectedNode = null;
  }

  onEditNodeSubmit(result: PositionFormData) {
    if (this.selectedNode) {
      this.store.updateNode(this.selectedNode.id, {
        name: result.name,
        nameTh: result.nameTh,
        nameZh: result.nameZh,
        nameVi: result.nameVi,
        section: result.section,
        salaryType: result.salaryType as any,
      });
    }
    this.closeEditNodeDialog();
  }
}
