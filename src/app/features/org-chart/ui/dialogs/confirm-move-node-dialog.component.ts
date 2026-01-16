import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-confirm-move-node-dialog',
  standalone: true,
  imports: [
    CommonModule,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmButtonImports,
    HlmCheckboxImports,
    HlmLabelImports,
  ],
  template: `
    <hlm-alert-dialog-content class="w-[95vw] max-w-md">
      <hlm-alert-dialog-header>
        <h2 hlmAlertDialogTitle>Confirm Move?</h2>
        <p hlmAlertDialogDescription>
          Are you sure you want to move
          <span class="font-bold text-foreground">{{ draggedNodeName }}</span> to under
          <span class="font-bold text-foreground">{{ targetNodeName }}</span
          >?
        </p>
      </hlm-alert-dialog-header>

      <div class="flex items-center gap-2 py-4">
        <hlm-checkbox
          id="dont-ask"
          [checked]="dontAskAgain"
          (changed)="dontAskAgain = !dontAskAgain"
        />
        <label
          hlmLabel
          for="dont-ask"
          class="cursor-pointer text-sm"
          (click)="dontAskAgain = !dontAskAgain"
        >
          Don't ask me again
        </label>
      </div>

      <hlm-alert-dialog-footer>
        <button hlmAlertDialogCancel (click)="onCancel.emit()">Cancel</button>
        <button hlmAlertDialogAction (click)="onConfirm.emit(dontAskAgain)">Continue</button>
      </hlm-alert-dialog-footer>
    </hlm-alert-dialog-content>
  `,
})
export class ConfirmMoveNodeDialogComponent {
  @Input() draggedNodeName = '';
  @Input() targetNodeName = '';
  @Output() onConfirm = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<void>();

  dontAskAgain = false;
}
