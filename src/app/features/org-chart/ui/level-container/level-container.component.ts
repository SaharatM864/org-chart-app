import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { WorkerNode } from '../../data-access/org.model';
import { NodeCardComponent } from '../node-card/node-card.component';

@Component({
  selector: 'app-level-container',
  standalone: true,
  imports: [CommonModule, DragDropModule, NodeCardComponent],
  template: `
    <div
      class="flex min-h-40 flex-col rounded-lg border border-dashed border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
    >
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-primary">Level {{ level }}</h3>
        <span class="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
          {{ nodes.length }} Positions
        </span>
      </div>

      <!-- Drop Zone -->
      <div
        cdkDropList
        [id]="'level-' + level"
        [cdkDropListData]="nodes"
        [cdkDropListConnectedTo]="connectedIds"
        (cdkDropListDropped)="onDrop($event)"
        class="flex min-h-24 flex-wrap gap-4"
        [class.bg-primary/5]="isDragging"
      >
        <app-node-card
          *ngFor="let node of nodes"
          [node]="node"
          [highlightType]="highlightedIds.get(node.id) || null"
          cdkDrag
          [cdkDragData]="node"
          (delete)="deleteNode.emit($event)"
          (highlight)="highlightNode.emit($event)"
          (unhighlight)="unhighlightNode.emit()"
        ></app-node-card>

        <!-- Empty State Placeholder if needed -->
        <div
          *ngIf="nodes.length === 0"
          class="flex w-full items-center justify-center py-8 text-sm text-muted-foreground/50 italic"
        >
          Drop positions here for Level {{ level }}
        </div>
      </div>
    </div>
  `,
})
export class LevelContainerComponent {
  @Input({ required: true }) level!: number;
  @Input({ required: true }) nodes: WorkerNode[] = [];
  @Input() connectedIds: string[] = [];
  @Input() isDragging = false;
  @Input() highlightedIds = new Map<string, 'current' | 'parent' | 'child'>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() itemDropped = new EventEmitter<CdkDragDrop<any>>();
  @Output() deleteNode = new EventEmitter<string>();
  @Output() highlightNode = new EventEmitter<string>();
  @Output() unhighlightNode = new EventEmitter<void>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDrop(event: CdkDragDrop<any>) {
    this.itemDropped.emit(event);
  }
}
