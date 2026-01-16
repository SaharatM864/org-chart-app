import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideUser } from '@ng-icons/lucide';
import { WorkerNode } from '../../data-access/org.model';

@Component({
  selector: 'app-node-card',
  standalone: true,
  imports: [CommonModule, ...HlmCardImports, ...HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideTrash2, lucideUser })],
  template: `
    <div
      hlmCard
      class="group relative flex w-56 flex-col overflow-hidden rounded-xl border-l-[6px] bg-white/95 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/95"
      [class.border-l-primary]="!node.parentId"
      [class.border-l-secondary]="node.parentId"
      [class.ring-2]="!!highlightType"
      [class.ring-primary]="highlightType === 'current'"
      [class.ring-green-500]="highlightType === 'parent'"
      [class.ring-orange-500]="highlightType === 'child'"
      [class.bg-blue-50]="highlightType === 'current'"
      [class.bg-green-50]="highlightType === 'parent'"
      [class.bg-orange-50]="highlightType === 'child'"
      [attr.data-level]="node.level"
      [attr.data-node-id]="node.id"
      (click)="onEdit($event)"
    >
      <!-- Delete Button (Visible on Hover) -->
      <button
        hlmBtn
        variant="ghost"
        size="icon"
        class="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        (click)="onDelete($event)"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
      >
        <ng-icon name="lucideTrash2" size="16"></ng-icon>
      </button>

      <!-- Content -->
      <div class="flex items-start gap-4">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200 text-gray-600 shadow-inner dark:from-zinc-800 dark:to-zinc-700 dark:text-gray-300"
          [class.from-primary-100]="highlightType === 'current'"
          [class.to-primary-200]="highlightType === 'current'"
          [class.text-primary-700]="highlightType === 'current'"
        >
          <ng-icon name="lucideUser" size="20"></ng-icon>
        </div>
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="truncate text-sm font-bold text-foreground" [title]="node.name">{{
            node.name
          }}</span>
          <span class="truncate text-xs font-medium text-muted-foreground">{{
            node.section || 'General'
          }}</span>
          <span *ngIf="node.nameTh" class="truncate text-[10px] text-muted-foreground/60">{{
            node.nameTh
          }}</span>
        </div>
      </div>

      <!-- Footer / ID / Level -->
      <div
        class="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] font-medium text-muted-foreground/80"
      >
        <span class="rounded-full bg-secondary/20 px-2 py-0.5 text-secondary-foreground"
          >Lvl {{ node.level }}</span
        >
        <span [class.text-primary]="node.salaryType === 'Management'">{{
          node.salaryType || 'Normal'
        }}</span>
      </div>
    </div>
  `,
})
export class NodeCardComponent {
  @Input({ required: true }) node!: WorkerNode;
  @Input() highlightType: 'current' | 'parent' | 'child' | null = null;
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() highlight = new EventEmitter<string>();
  @Output() unhighlight = new EventEmitter<void>();

  onDelete(event: Event) {
    event.stopPropagation(); // Prevent drag start if clicking delete
    // setTimeout to break the event loop and prevent stack overflow
    setTimeout(() => {
      this.delete.emit(this.node.id);
    }, 0);
  }

  onEdit(event: Event) {
    this.edit.emit(this.node.id);
  }

  onMouseEnter() {
    this.highlight.emit(this.node.id);
  }

  onMouseLeave() {
    this.unhighlight.emit();
  }
}
