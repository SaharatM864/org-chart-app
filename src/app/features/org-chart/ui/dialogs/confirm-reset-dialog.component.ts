import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-confirm-reset-dialog',
  standalone: true,
  imports: [CommonModule, BrnAlertDialogImports, HlmAlertDialogImports, HlmButtonImports],
  template: `
    <hlm-alert-dialog-content class="w-[95vw] max-w-md">
      <hlm-alert-dialog-header>
        <h2 hlmAlertDialogTitle>Reset & Generate Random Chart?</h2>
        <p hlmAlertDialogDescription>
          This will delete all current nodes and generate a new random structure. This action cannot
          be undone.
        </p>
      </hlm-alert-dialog-header>

      <hlm-alert-dialog-footer>
        <button hlmAlertDialogCancel (click)="onCancel.emit()">Cancel</button>
        <button hlmAlertDialogAction (click)="onConfirm.emit()">Confirm Reset</button>
      </hlm-alert-dialog-footer>
    </hlm-alert-dialog-content>
  `,
})
export class ConfirmResetDialogComponent {
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
