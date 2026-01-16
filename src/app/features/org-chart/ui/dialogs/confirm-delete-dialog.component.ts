import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, HlmButton, NgIconComponent],
  template: `
    <div
      class="relative z-50 mx-auto grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border bg-background p-6 shadow-lg sm:mx-0 sm:max-w-lg"
    >
      <div class="flex flex-col gap-2 text-center sm:text-start">
        <h3 class="flex items-center gap-2 text-lg font-semibold text-destructive">
          <ng-icon name="lucideAlertTriangle" class="text-destructive"></ng-icon>
          Confirm Deletion
        </h3>
        <p class="text-sm text-muted-foreground">
          Are you sure you want to delete this position? This action cannot be undone.
        </p>
      </div>

      <div class="py-4">
        <div *ngIf="context.hasChildren" class="flex flex-col gap-4">
          <div
            class="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400"
          >
            <strong>Warning:</strong> This position has {{ context.childrenCount }} direct reports.
          </div>

          <p class="text-sm">How would you like to handle the child nodes?</p>

          <div class="flex gap-2">
            <button hlmBtn variant="outline" class="flex-1" (click)="onAction.emit('cascade')">
              Delete All Children
            </button>
            <button hlmBtn variant="outline" class="flex-1" (click)="onAction.emit('reparent')">
              Move to Grandparent
            </button>
          </div>
        </div>

        <div *ngIf="!context.hasChildren" class="text-sm">
          This node has no children. It will be safely removed.
        </div>
      </div>

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
        <button hlmBtn variant="ghost" (click)="onAction.emit(null)">Cancel</button>
        <button
          *ngIf="!context.hasChildren"
          hlmBtn
          variant="destructive"
          (click)="onAction.emit('delete')"
        >
          Delete
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  @Input() context: { hasChildren: boolean; childrenCount: number } = {
    hasChildren: false,
    childrenCount: 0,
  };
  @Output() onAction = new EventEmitter<'delete' | 'cascade' | 'reparent' | null>();
}
