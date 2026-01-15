import { Component, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OrgStore } from '../../data-access/org.store';
import { PositionItemComponent } from '../../ui/position-item/position-item.component';
import { CreatePositionDialogComponent } from '../../ui/dialogs/create-position-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../ui/dialogs/confirm-delete-dialog.component';
import { NodeCardComponent } from '../../ui/node-card/node-card.component';
import { transformToOrgChartNode } from '../../utils/org-chart-adapter';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { BrnDialogService } from '@spartan-ng/brain/dialog';
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

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    PositionItemComponent,
    NodeCardComponent,
    NgxInteractiveOrgChart,
    ...HlmButtonImports,
    NgIconComponent,
  ],
  providers: [
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
    <div
      class="flex h-[calc(100vh-3.5rem)] w-full bg-background pt-14 text-foreground"
      cdkDropListGroup
    >
      <!-- Sidebar / Position List -->
      <aside class="bg-card flex w-80 flex-col gap-4 overflow-y-auto border-r border-border p-4">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-xl font-bold">
            <ng-icon name="lucideLayoutGrid"></ng-icon>
            Positions
          </h2>
          <button hlmBtn variant="outline" size="sm" (click)="openCreatePositionDialog()">
            <ng-icon name="lucidePlus" size="16"></ng-icon>
          </button>
        </div>

        <p class="text-xs text-muted-foreground">
          Drag positions from here to add new nodes (Upcoming feature).
        </p>

        <div
          cdkDropList
          [cdkDropListData]="store.sidebarPositions()"
          class="flex min-h-25 flex-col gap-2"
        >
          <app-position-item
            *ngFor="let item of store.sidebarPositions()"
            [item]="item"
            cdkDrag
            [cdkDragData]="item"
          ></app-position-item>
        </div>
      </aside>

      <!-- Main Chart Area -->
      <main class="figma-bg-dots relative flex-1 overflow-hidden">
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
  private readonly _dialogService = inject(BrnDialogService);

  @ViewChild('orgChart') orgChart?: NgxInteractiveOrgChart<OrgChartNode>;

  // Transform store data to OrgChartNode structure
  // We assume single root for now. If multiple, we might need a virtual root or handle logic differently.
  chartData = computed(() => {
    const nodes = transformToOrgChartNode(this.store.nodeMap(), this.store.rootIds());
    return nodes.length > 0 ? nodes[0] : null;
  });

  themeOptions: NgxInteractiveOrgChartTheme = {
    node: {
      background: 'transparent', // We use custom card with its own background
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

  // Library specific checks
  canDragNode = () => true;
  canDropNode = () => true;

  // Handle drop event from the library
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNodeDrop(event: any) {
    // event: { draggedNode: OrgChartNode, targetNode: OrgChartNode }
    // We map this back to our store action
    if (event.draggedNode && event.targetNode) {
      this.store.moveNode({
        nodeId: event.draggedNode.id,
        newParentId: event.targetNode.id,
        newIndex: 0, // Logic for index might need refinement if order matters, but for now append to start or end
      });
    }
  }

  openCreatePositionDialog() {
    const dialogRef = this._dialogService.open(CreatePositionDialogComponent);

    dialogRef.closed$.subscribe((result) => {
      if (result) {
        this.store.addSidebarPosition({
          name: result.name,
          code: result.section,
        });
      }
    });
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

    dialogRef.closed$.subscribe((action) => {
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
