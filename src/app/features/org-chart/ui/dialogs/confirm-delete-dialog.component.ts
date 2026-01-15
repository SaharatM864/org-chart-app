import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle } from '@ng-icons/lucide';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, ...HlmDialogImports, HlmButton, NgIconComponent],
  providers: [provideIcons({ lucideAlertTriangle })],
  template: `
    <hlm-dialog-content class="sm:max-w-106.25">
      <hlm-dialog-header>
        <h3 hlmDialogTitle class="flex items-center gap-2 text-destructive">
          <ng-icon name="lucideAlertTriangle" class="text-destructive"></ng-icon>
          Confirm Deletion
        </h3>
        <p hlmDialogDescription>
          Are you sure you want to delete this position? This action cannot be undone.
        </p>
      </hlm-dialog-header>

      <div class="py-4">
        <div *ngIf="context.hasChildren" class="flex flex-col gap-4">
          <div
            class="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400"
          >
            <strong>Warning:</strong> This position has {{ context.childrenCount }} direct reports.
          </div>

          <p class="text-sm">How would you like to handle the child nodes?</p>

          <div class="flex gap-2">
            <button hlmBtn variant="outline" class="flex-1" (click)="selectAction('cascade')">
              Delete All Children
            </button>
            <button hlmBtn variant="outline" class="flex-1" (click)="selectAction('reparent')">
              Move to Grandparent
            </button>
          </div>
        </div>

        <div *ngIf="!context.hasChildren" class="text-sm">
          This node has no children. It will be safely removed.
        </div>
      </div>

      <hlm-dialog-footer class="gap-2">
        <button hlmBtn variant="ghost" (click)="close()">Cancel</button>
        <button
          *ngIf="!context.hasChildren"
          hlmBtn
          variant="destructive"
          (click)="selectAction('delete')"
        >
          Delete
        </button>
      </hlm-dialog-footer>
    </hlm-dialog-content>
  `,
})
export class ConfirmDeleteDialogComponent {
  private readonly _dialogRef = inject(BrnDialogRef);
  public readonly context = injectBrnDialogContext<{
    hasChildren: boolean;
    childrenCount: number;
  }>();

  selectAction(action: 'delete' | 'cascade' | 'reparent') {
    this._dialogRef.close(action);
  }

  close() {
    this._dialogRef.close(null);
  }
}
