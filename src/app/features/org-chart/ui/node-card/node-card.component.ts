import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideUser } from '@ng-icons/lucide';
import { WorkerNode } from '../../data-access/org.model';

@Component({
  selector: 'app-node-card',
  standalone: true,
  imports: [CommonModule, ...HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideTrash2, lucideUser })],
  template: `
    <!-- 
      NOTE: manually applying card styles instead of using hlmCard directive 
      to prevent background color override issues during state changes (hover/highlight).
      Using bg-white/95 explicitly ensures stable background color.
    -->
    <div
      class="group relative flex w-56 flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-border/50 dark:shadow-none dark:hover:border-primary/50"
      [class.ring-2]="!!highlightType"
      [class.ring-primary]="highlightType === 'current'"
      [class.ring-green-500]="highlightType === 'parent'"
      [class.ring-orange-500]="highlightType === 'child'"
      [class.bg-blue-50]="highlightType === 'current'"
      [class.dark:bg-blue-900/20]="highlightType === 'current'"
      [class.bg-green-50]="highlightType === 'parent'"
      [class.dark:bg-green-900/20]="highlightType === 'parent'"
      [class.bg-orange-50]="highlightType === 'child'"
      [class.dark:bg-orange-900/20]="highlightType === 'child'"
      [attr.data-level]="node.level"
      [attr.data-node-id]="node.id"
      (click)="onEdit()"
    >
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

      <div class="flex items-start gap-4">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200 text-gray-600 shadow-inner dark:border dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-300 dark:shadow-none"
          [class.from-primary-100]="highlightType === 'current'"
          [class.dark:from-primary-900/50]="highlightType === 'current'"
          [class.to-primary-200]="highlightType === 'current'"
          [class.dark:to-primary-800/50]="highlightType === 'current'"
          [class.text-primary-700]="highlightType === 'current'"
          [class.dark:text-primary-300]="highlightType === 'current'"
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

      <div class="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
        <span
          class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          Lvl {{ node.level }}
        </span>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium"
          [ngClass]="salaryTypeClasses"
        >
          {{ node.salaryType || 'Normal' }}
        </span>
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

  get salaryTypeClasses(): string {
    switch (this.node.salaryType) {
      case 'Management':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  }

  onDelete(event: Event) {
    event.stopPropagation();

    setTimeout(() => {
      this.delete.emit(this.node.id);
    }, 0);
  }

  onEdit() {
    this.edit.emit(this.node.id);
  }

  onMouseEnter() {
    this.highlight.emit(this.node.id);
  }

  onMouseLeave() {
    this.unhighlight.emit();
  }
}
