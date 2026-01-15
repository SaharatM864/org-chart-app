import { Component, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { OrgStore } from '../../data-access/org.store';
import { PositionItemComponent } from '../../ui/position-item/position-item.component';
import { AddPositionDialogComponent } from '../../ui/dialogs/add-position-dialog.component';
import { EditPositionDialogComponent } from '../../ui/dialogs/edit-position-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../ui/dialogs/confirm-delete-dialog.component';
import { NodeCardComponent } from '../../ui/node-card/node-card.component';
import { transformToOrgChartNode } from '../../utils/org-chart-adapter';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogService } from '@spartan-ng/helm/dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideLayoutGrid,
  lucideMinus,
  lucideMaximize,
  lucideMinimize,
  lucideMap,
  lucideArrowRightLeft,
  lucideChevronsDown,
  lucideChevronsUp,
  lucideRotateCcw,
  lucideMove,
} from '@ng-icons/lucide';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  NgxInteractiveOrgChart,
  OrgChartNode,
  NgxInteractiveOrgChartTheme,
} from 'ngx-interactive-org-chart';
import { PositionFormData, PositionItem, WorkerNode } from '../../data-access/org.model';
import { SelectParentDialogComponent } from '../../ui/dialogs/select-parent-dialog.component';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    PositionItemComponent,
    NodeCardComponent,
    NgxInteractiveOrgChart,
    HlmButton,
    NgIconComponent,
    BrnDialogContent,
    HlmDialog,
    AddPositionDialogComponent,
    EditPositionDialogComponent,
    SelectParentDialogComponent,
  ],
  providers: [
    HlmDialogService,
    provideIcons({
      lucidePlus,
      lucideLayoutGrid,
      lucideMinus,
      lucideMaximize,
      lucideMinimize,
      lucideMap,
      lucideArrowRightLeft,
      lucideChevronsDown,
      lucideChevronsUp,
      lucideRotateCcw,
      lucideMove,
    }),
  ],
  template: `
    <!-- 
      Using cdkDropListGroup to automatically connect 
      Sidebar (Source) -> NodeCards (Targets) 
    -->
    <div class="flex h-full w-full bg-background text-foreground" cdkDropListGroup>
      <!-- Sidebar / Position List -->
      <aside class="bg-card flex w-80 flex-col gap-4 overflow-y-auto border-r border-border p-4">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-xl font-bold">
            <ng-icon name="lucideLayoutGrid"></ng-icon>
            Positions
          </h2>
          <button hlmBtn variant="outline" size="sm" (click)="openAddPositionDialog()">
            <ng-icon name="lucidePlus" size="16"></ng-icon>
          </button>
        </div>

        <p class="text-xs text-muted-foreground">Drag positions from here to add new nodes.</p>

        <div
          cdkDropList
          [cdkDropListData]="store.sidebarPositions()"
          class="flex min-h-25 flex-col gap-2"
          (cdkDropListDropped)="onSidebarDrop($event)"
        >
          <app-position-item
            *ngFor="let item of store.sidebarPositions()"
            [item]="item"
            cdkDrag
            [cdkDragData]="item"
            (cdkDragStarted)="onDragStarted()"
            (edit)="openEditPositionDialog($event)"
          ></app-position-item>
        </div>
      </aside>

      <!-- Main Chart Area -->
      <main
        class="figma-bg-dots relative flex-1 overflow-hidden"
        id="main-drop-zone"
        cdkDropList
        (cdkDropListDropped)="onBackgroundDrop($event)"
      >
        <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <!-- Toolbar Group -->
          <div
            class="flex flex-col gap-1 rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60"
          >
            <button hlmBtn variant="ghost" size="icon" (click)="zoomIn()" title="Zoom In">
              <ng-icon name="lucidePlus" size="18"></ng-icon>
            </button>
            <button hlmBtn variant="ghost" size="icon" (click)="zoomOut()" title="Zoom Out">
              <ng-icon name="lucideMinus" size="18"></ng-icon>
            </button>
            <button hlmBtn variant="ghost" size="icon" (click)="resetView()" title="Reset View">
              <ng-icon name="lucideRotateCcw" size="18"></ng-icon>
            </button>
            <div class="my-1 h-px bg-border"></div>
            <button
              hlmBtn
              variant="ghost"
              size="icon"
              (click)="toggleDragAndDrop()"
              [class.bg-accent]="isDraggable"
              title="{{ isDraggable ? 'Disable Drag & Drop' : 'Enable Drag & Drop' }}"
            >
              <ng-icon name="lucideMove" size="18"></ng-icon>
            </button>
            <div class="my-1 h-px bg-border"></div>
            <button
              hlmBtn
              variant="ghost"
              size="icon"
              (click)="switchLayout()"
              title="Toggle Layout (Vertical/Horizontal)"
            >
              <ng-icon
                name="lucideArrowRightLeft"
                size="18"
                [class.rotate-90]="layoutDirection === 'vertical'"
              ></ng-icon>
            </button>
            <button
              hlmBtn
              variant="ghost"
              size="icon"
              (click)="toggleMiniMap()"
              [class.bg-accent]="showMiniMap"
              title="Toggle Mini Map"
            >
              <ng-icon name="lucideMap" size="18"></ng-icon>
            </button>
            <div class="my-1 h-px bg-border"></div>
            <button hlmBtn variant="ghost" size="icon" (click)="expandAll()" title="Expand All">
              <ng-icon name="lucideChevronsDown" size="18"></ng-icon>
            </button>
            <button hlmBtn variant="ghost" size="icon" (click)="collapseAll()" title="Collapse All">
              <ng-icon name="lucideChevronsUp" size="18"></ng-icon>
            </button>
          </div>
        </div>

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
                [isHighlighted]="store.highlightedIds().has(node.id)"
                (delete)="onDeleteNode($event)"
                (highlight)="store.setHighlight($event)"
                (unhighlight)="store.setHighlight(null)"
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
      </main>
    </div>

    <!-- Dialogs -->

    <!-- Add Position Dialog -->
    <hlm-dialog [state]="addDialogState" (closed)="closeAddPositionDialog()">
      <app-add-position-dialog
        *brnDialogContent="let ctx"
        (formSubmit)="onAddPositionSubmit($event)"
        (cancel)="closeAddPositionDialog()"
      >
      </app-add-position-dialog>
    </hlm-dialog>

    <!-- Edit Position Dialog -->
    <hlm-dialog [state]="editDialogState" (closed)="closeEditPositionDialog()">
      <app-edit-position-dialog
        *brnDialogContent="let ctx"
        [item]="selectedPositionItem!"
        (formSubmit)="onEditPositionSubmit($event)"
        (cancel)="closeEditPositionDialog()"
      >
      </app-edit-position-dialog>
    </hlm-dialog>

    <!-- Select Parent Dialog -->
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
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .figma-bg-dots {
        background-color: #f5f5f5;
        background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
        background-size: 20px 20px;
      }
    `,
  ],
})
export class ChartViewComponent {
  readonly store = inject(OrgStore);
  private readonly _dialogService = inject(HlmDialogService);

  // Dialog State
  addDialogState: 'open' | 'closed' = 'closed';
  editDialogState: 'open' | 'closed' = 'closed';
  selectParentDialogState: 'open' | 'closed' = 'closed';
  selectedPositionItem: PositionItem | null = null;
  parentCandidates: WorkerNode[] = [];
  pendingDropPosition: PositionItem | null = null;

  @ViewChild('orgChart') orgChart?: NgxInteractiveOrgChart<OrgChartNode>;

  // Transform store data to OrgChartNode structure
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
      color: '#e2e8f0', // border-border
      activeColor: '#3b82f6', // primary
    },
  };

  // View State
  layoutDirection: 'vertical' | 'horizontal' = 'vertical';
  showMiniMap = false;
  isDraggable = true;

  ngOnInit() {
    this.store.loadChart();
  }

  canDragNode = () => true;
  canDropNode = () => true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNodeDrop(event: any) {
    if (event.draggedNode && event.targetNode) {
      this.store.moveNode({
        nodeId: event.draggedNode.id,
        newParentId: event.targetNode.id,
        newIndex: 0,
      });
    }
  }

  // --- Add Position Logic ---
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

  // --- Edit Position Logic ---
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

  onSidebarDrop(event: CdkDragDrop<PositionItem[]>) {
    if (event.previousContainer === event.container) {
      this.store.reorderSidebarPositions(event.previousIndex, event.currentIndex);
    }
  }

  // --- Drag & Drop Handlers ---
  onDragStarted() {
    // No-op for now, but good hook for visual feedback
  }

  // Handle drop on the background (Main Area)
  // This becomes the Centralized Handler for ALL drops (Background & Nodes)
  onBackgroundDrop(event: CdkDragDrop<any>) {
    // 1. Get the item data (from source)
    const item = event.item.data as PositionItem;
    if (!item) return;

    // 2. Hit Test: Check if we actually dropped on a Node
    // We rely on document.elementFromPoint because CDK DropLists are now simplified
    const { x, y } = event.dropPoint;
    const element = document.elementFromPoint(x, y);
    const nodeElement = element?.closest('[data-node-id]');

    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-node-id');
      if (nodeId) {
        console.log('Hit Test Detection: Dropped on Node', nodeId);
        this.store.addNode(nodeId, item);
        return; // Exit early, do not show dialog
      }
    }

    // 3. If NOT on a node (Empty Space), proceed with "Select Parent" Logic
    const allNodes = Object.values(this.store.nodeMap());

    if (allNodes.length === 0) {
      // If no nodes exist, just add as root (or handle as first node)
      this.store.addNode(null, item);
    } else {
      // Open dialog to let user select parent
      this.parentCandidates = allNodes;
      this.pendingDropPosition = item;
      this.selectParentDialogState = 'open';
    }
  }

  // Removed onDragEnded and handleEmptySpaceDrop as we now use native cdkDropList

  // --- Select Parent Dialog ---
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

    const hasChildren = node.childrenIds.length > 0;
    const dialogOptions = {
      context: { hasChildren, childrenCount: node.childrenIds.length },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dialogRef = this._dialogService.open(ConfirmDeleteDialogComponent, dialogOptions as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dialogRef.closed$.subscribe((action: any) => {
      if (!action) return;

      if (action === 'delete') {
        this.store.deleteNode(nodeId, false);
      } else if (action === 'cascade') {
        this.store.deleteNode(nodeId, false);
      } else if (action === 'reparent') {
        this.store.deleteNode(nodeId, true);
      }
    });
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
}
