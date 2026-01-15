import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX, lucideUser } from '@ng-icons/lucide';
import { PositionItem, WorkerNode } from '../../data-access/org.model';

@Component({
  selector: 'app-node-card',
  standalone: true,
  imports: [CommonModule, DragDropModule, ...HlmCardImports, ...HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideX, lucideUser })],
  template: `
    <div
      hlmCard
      cdkDropList
      (cdkDropListDropped)="onCdkDrop($event)"
      class="group relative flex w-50 flex-col overflow-hidden border-l-4 bg-white p-3 transition-all hover:shadow-md"
      [class.border-l-primary]="!node.parentId"
      [class.border-l-secondary]="node.parentId"
      [class.ring-2]="isHighlighted"
      [class.ring-primary]="isHighlighted"
      [attr.data-level]="node.level"
      [attr.data-node-id]="node.id"
    >
      <!-- Delete Button (Visible on Hover) -->
      <button
        hlmBtn
        variant="ghost"
        size="icon"
        class="absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        (click)="onDelete($event)"
      >
        <ng-icon name="lucideX" size="14"></ng-icon>
      </button>

      <!-- Content -->
      <div
        class="flex items-start gap-3"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <ng-icon name="lucideUser" size="16"></ng-icon>
        </div>
        <div class="flex flex-col overflow-hidden">
          <span class="truncate text-sm font-bold text-foreground" [title]="node.name">{{
            node.name
          }}</span>
          <span class="truncate text-xs text-muted-foreground">{{
            node.section || 'General'
          }}</span>
          <span *ngIf="node.nameTh" class="truncate text-[10px] text-muted-foreground/70">{{
            node.nameTh
          }}</span>
        </div>
      </div>

      <!-- Footer / ID / Level -->
      <div
        class="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground"
      >
        <span>Lvl {{ node.level }}</span>
        <span>{{ node.salaryType || 'Normal' }}</span>
      </div>
    </div>
  `,
})
export class NodeCardComponent {
  @Input({ required: true }) node!: WorkerNode;
  @Input() isHighlighted = false;
  @Output() delete = new EventEmitter<string>();
  @Output() highlight = new EventEmitter<string>();
  @Output() unhighlight = new EventEmitter<void>();
  @Output() incomingNodeDrop = new EventEmitter<PositionItem>();

  onDelete(event: Event) {
    event.stopPropagation(); // Prevent drag start if clicking delete
    this.delete.emit(this.node.id);
  }

  onMouseEnter() {
    this.highlight.emit(this.node.id);
  }

  onMouseLeave() {
    this.unhighlight.emit();
  }

  // Handle drop from Sidebar (Connected via cdkDropListGroup in parent)
  // We use CDK instead of Native Drag to avoid conflicts with the library's internal behavior.
  onCdkDrop(event: CdkDragDrop<PositionItem>) {
    // Only handle if item data is available (from Sidebar)
    if (event.item.data) {
      console.log('CDK Drop on Node:', this.node.name, 'Data:', event.item.data);
      this.incomingNodeDrop.emit(event.item.data);
    }
  }
}
