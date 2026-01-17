import { Component, computed, inject, ViewChild, effect, ElementRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragRelease, DragDropModule } from '@angular/cdk/drag-drop';

import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { OrgStore } from '../../data-access/org.store';
import { AddPositionDialogComponent } from '../../ui/dialogs/add-position-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../ui/dialogs/confirm-delete-dialog.component';
import { ConfirmMoveNodeDialogComponent } from '../../ui/dialogs/confirm-move-node-dialog.component';
import { ConfirmResetDialogComponent } from '../../ui/dialogs/confirm-reset-dialog.component';
import { NodeCardComponent } from '../../ui/node-card/node-card.component';
import { ChartViewSkeletonComponent } from '../../ui/chart-view-skeleton/chart-view-skeleton.component';
import { PositionSidebarSkeletonComponent } from '../../ui/position-sidebar-skeleton/position-sidebar-skeleton.component';
import { EditNodeDialogComponent } from '../../ui/dialogs/edit-node-dialog.component';
import { transformToOrgChartNode } from '../../utils/org-chart-adapter';
import { HlmDialog } from '@spartan-ng/helm/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import {
  NgxInteractiveOrgChart,
  OrgChartNode,
  NgxInteractiveOrgChartTheme,
} from 'ngx-interactive-org-chart';
import {
  PositionFormData,
  PositionItem,
  WorkerNode,
  SalaryType,
} from '../../data-access/org.model';
import { SelectParentDialogComponent } from '../../ui/dialogs/select-parent-dialog.component';
import { ChartToolbarComponent } from '../../ui/chart-toolbar/chart-toolbar.component';
import { PositionSidebarComponent } from '../../ui/position-sidebar/position-sidebar.component';
import { EditPositionDialogComponent } from '../../ui/dialogs/edit-position-dialog.component';
import { ThemeStore } from '../../../../core/theme/theme.service';
import { ChartDragDropService } from './chart-drag-drop.service';

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
    HlmAlertDialogImports,
    BrnAlertDialogImports,
    AddPositionDialogComponent,
    EditPositionDialogComponent,
    EditNodeDialogComponent,
    SelectParentDialogComponent,
    ConfirmDeleteDialogComponent,
    ConfirmMoveNodeDialogComponent,
    ConfirmResetDialogComponent,
    ChartToolbarComponent,
    PositionSidebarComponent,
    ChartViewSkeletonComponent,
    PositionSidebarSkeletonComponent,
  ],
  template: `
    <div class="flex h-full w-full bg-background text-foreground" cdkDropListGroup>
      <main
        class="figma-bg-dots relative flex-1 overflow-hidden"
        style="--chart-bg: var(--muted);"
        id="main-drop-zone"
        cdkDropList
        (cdkDropListDropped)="onBackgroundDrop($event)"
      >
        <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <app-chart-toolbar
            [isDraggable]="isDraggable"
            [showMiniMap]="showMiniMap"
            [layoutDirection]="layoutDirection"
            [isAllExpanded]="isAllExpanded"
            (zoomIn)="zoomIn()"
            (zoomOut)="zoomOut()"
            (resetView)="resetView()"
            (toggleDragAndDrop)="toggleDragAndDrop()"
            (switchLayout)="switchLayout()"
            (toggleMiniMap)="toggleMiniMap()"
            (toggleExpand)="onToggleExpand()"
            (toggleSidebar)="toggleSidebar()"
            (generateRandom)="onGenerateRandom()"
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
              [miniMapPosition]="miniMapPosition"
              [miniMapWidth]="miniMapWidth"
              [miniMapHeight]="miniMapHeight"
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
        class="fixed inset-y-0 right-0 z-50 bg-background transition-all duration-300 ease-in-out lg:static lg:z-auto lg:overflow-hidden"
        [class.translate-x-full]="!isSidebarOpen"
        [class.translate-x-0]="isSidebarOpen"
        [class.lg:translate-x-0]="true"
        [class.lg:w-0]="!isSidebarOpen"
        [class.lg:w-80]="isSidebarOpen"
        [class.w-80]="true"
        [class.shadow-xl]="isSidebarOpen"
        [class.lg:shadow-none]="true"
      >
        <app-position-sidebar-skeleton *ngIf="store.isLoading(); else sidebar" />
        <ng-template #sidebar>
          <app-position-sidebar
            [positions]="store.sidebarPositions()"
            (addPosition)="openAddPositionDialog()"
            (editPosition)="openEditPositionDialog($event)"
            (reorder)="onSidebarReorder($event)"
            (dragReleased)="handleDragReleased($event)"
            (close)="closeSidebar()"
          ></app-position-sidebar>
        </ng-template>
      </div>

      <div
        *ngIf="deleteDialogState.isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="relative w-full sm:max-w-md">
          <app-confirm-delete-dialog
            [context]="{
              hasChildren: deleteDialogState.hasChildren,
              childrenCount: deleteDialogState.childrenCount,
              hasParent: deleteDialogState.hasParent,
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

    <hlm-alert-dialog [state]="moveNodeDialogState" (closed)="onCancelMoveNode()">
      <app-confirm-move-node-dialog
        *brnAlertDialogContent="let ctx"
        [draggedNodeName]="draggedNodeName"
        [targetNodeName]="targetNodeName"
        (onConfirm)="onConfirmMoveNode($event)"
        (onCancel)="onCancelMoveNode()"
      >
      </app-confirm-move-node-dialog>
    </hlm-alert-dialog>

    <hlm-alert-dialog [state]="resetDialogState" (closed)="closeResetDialog()">
      <app-confirm-reset-dialog
        *brnAlertDialogContent="let ctx"
        (onConfirm)="onConfirmReset()"
        (onCancel)="closeResetDialog()"
      >
      </app-confirm-reset-dialog>
    </hlm-alert-dialog>
  `,
})
export class ChartViewComponent {
  readonly store = inject(OrgStore);
  private readonly _dragDropService = inject(ChartDragDropService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _themeStore = inject(ThemeStore);
  private readonly _theme = this._themeStore.theme;

  addDialogState: 'open' | 'closed' = 'closed';
  editDialogState: 'open' | 'closed' = 'closed';
  editNodeDialogState: 'open' | 'closed' = 'closed';
  selectParentDialogState: 'open' | 'closed' = 'closed';
  moveNodeDialogState: 'open' | 'closed' = 'closed';
  resetDialogState: 'open' | 'closed' = 'closed';
  isSidebarOpen = true;

  deleteDialogState = {
    isOpen: false,
    nodeId: null as string | null,
    hasChildren: false,
    childrenCount: 0,
    hasParent: false,
  };

  selectedPositionItem: PositionItem | null = null;
  selectedNode: WorkerNode | null = null;
  parentCandidates: WorkerNode[] = [];
  pendingDropPosition: PositionItem | null = null;

  pendingMovePayload: { nodeId: string; newParentId: string } | null = null;
  draggedNodeName = '';
  targetNodeName = '';

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

    effect(() => {
      const theme = this._theme();
      if (theme === 'dark') {
        this.themeOptions = {
          ...this.themeOptions,
          connector: {
            color: '#52525b', // zinc-600
            activeColor: '#60a5fa', // blue-400
          },
        };
      } else {
        this.themeOptions = {
          ...this.themeOptions,
          connector: {
            color: '#d1d5db', // gray-300
            activeColor: '#3b82f6', // blue-500
          },
        };
      }
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
      color: '#d1d5db',
      activeColor: '#3b82f6',
    },
  };

  layoutDirection: 'vertical' | 'horizontal' = 'vertical';
  showMiniMap = false;
  miniMapWidth = 200;
  miniMapHeight = 150;
  miniMapPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right';
  isDraggable = true;
  isAllExpanded = true;

  ngOnInit() {
    this.store.loadChart();
  }

  canDragNode = () => true;
  canDropNode = () => true;

  onNodeDrop(event: { draggedNode: OrgChartNode; targetNode: OrgChartNode }) {
    if (event.draggedNode?.id && event.targetNode?.id) {
      this.pendingMovePayload = {
        nodeId: event.draggedNode.id,
        newParentId: event.targetNode.id,
      };

      const skipConfirm = sessionStorage.getItem('skipMoveConfirmation') === 'true';

      if (skipConfirm) {
        this.onConfirmMoveNode(false);
      } else {
        const draggedData = event.draggedNode.data as WorkerNode;
        const targetData = event.targetNode.data as WorkerNode;

        this.draggedNodeName = draggedData?.name || 'Unknown';
        this.targetNodeName = targetData?.name || 'Unknown';
        this.moveNodeDialogState = 'open';
      }
    }
  }

  onConfirmMoveNode(dontAskAgain: boolean) {
    if (dontAskAgain) {
      sessionStorage.setItem('skipMoveConfirmation', 'true');
    }

    if (this.pendingMovePayload) {
      this.store.moveNode({
        nodeId: this.pendingMovePayload.nodeId,
        newParentId: this.pendingMovePayload.newParentId,
        newIndex: 0,
      });
    }
    this.closeMoveNodeDialog();
  }

  onCancelMoveNode() {
    this.closeMoveNodeDialog();
  }

  closeMoveNodeDialog() {
    this.moveNodeDialogState = 'closed';
    this.pendingMovePayload = null;
    this.draggedNodeName = '';
    this.targetNodeName = '';
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
    // Legacy handler - kept for fallback but logic moved to handleDragReleased
    const item = event.item.data as PositionItem;
    if (!item) return;

    // If we are here, it means the drop was successful on the background.
    // We should still try to run the animation if it wasn't already run by dragReleased.
    // But since dragReleased runs first, we might just want to ignore this or use it as confirmation.
    // For now, let's rely on dragReleased for the animation.

    // const { x, y } = event.dropPoint;
    // this.handleDropLogic(x, y, item);
  }

  handleDragReleased(event: { item: PositionItem; event: CdkDragRelease }) {
    const { item, event: cdkEvent } = event;
    const mainDropZone = document.getElementById('main-drop-zone');

    const result = this._dragDropService.handleDragReleased(cdkEvent, mainDropZone);

    if (result.type === 'node') {
      this.store.addNode(result.nodeId, item);
    } else if (result.type === 'background') {
      this.handleBackgroundDrop(item);
    }
  }

  private handleBackgroundDrop(item: PositionItem) {
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
      hasParent: !!node.parentId,
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
      hasParent: false,
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

  onToggleExpand() {
    if (this.isAllExpanded) {
      this.collapseAll();
      this.isAllExpanded = false;
    } else {
      this.expandAll();
      this.isAllExpanded = true;
    }
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
        salaryType: result.salaryType as SalaryType,
      });
    }
    this.closeEditNodeDialog();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  onGenerateRandom() {
    this.resetDialogState = 'open';
  }

  closeResetDialog() {
    this.resetDialogState = 'closed';
  }

  onConfirmReset() {
    this.store.generateRandomChart();
    this.closeResetDialog();
  }
}
