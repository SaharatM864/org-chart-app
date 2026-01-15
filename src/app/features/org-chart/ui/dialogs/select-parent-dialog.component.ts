import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { WorkerNode } from '../../data-access/org.model';

@Component({
  selector: 'app-select-parent-dialog',
  standalone: true,
  imports: [CommonModule, ...HlmDialogImports, HlmButton],
  template: `
    <hlm-dialog-content class="sm:max-w-106.25">
      <hlm-dialog-header>
        <h3 hlmDialogTitle>Select Parent Node</h3>
        <p hlmDialogDescription>
          Please select a parent from the previous level (Level {{ context.level - 1 }}).
        </p>
      </hlm-dialog-header>

      <div class="max-h-75 overflow-y-auto py-4">
        <div *ngIf="context.parents.length === 0" class="text-center text-muted-foreground">
          No available parents found.
        </div>

        <div class="grid gap-2">
          <button
            *ngFor="let parent of context.parents"
            hlmBtn
            variant="outline"
            class="flex h-auto flex-col items-start justify-start gap-1 px-4 py-3"
            (click)="select(parent.id)"
          >
            <span class="font-bold">{{ parent.name }}</span>
            <span class="text-xs text-muted-foreground"
              >{{ parent.section }} | Lvl {{ parent.level }}</span
            >
          </button>
        </div>
      </div>

      <hlm-dialog-footer>
        <button hlmBtn variant="ghost" (click)="close()">Cancel</button>
      </hlm-dialog-footer>
    </hlm-dialog-content>
  `,
})
export class SelectParentDialogComponent {
  private readonly _dialogRef = inject(BrnDialogRef);
  public readonly context = injectBrnDialogContext<{ parents: WorkerNode[]; level: number }>();

  select(parentId: string) {
    this._dialogRef.close(parentId);
  }

  close() {
    this._dialogRef.close(null);
  }
}
