import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HlmDialogContent,
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmLabel } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkerNode } from '../../data-access/org.model';

@Component({
  selector: 'app-select-parent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmButton,
    HlmLabel,
    BrnSelectImports,
    HlmSelectImports,
  ],
  template: `
    <hlm-dialog-content class="sm:max-w-106.25">
      <hlm-dialog-header>
        <h3 hlmDialogTitle>Select Parent Node</h3>
        <p hlmDialogDescription>
          Multiple nodes found at the level above. Please select which node this position should
          report to.
        </p>
      </hlm-dialog-header>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label hlmLabel>Parent Node</label>
          <brn-select
            class="inline-block w-full"
            placeholder="Select a parent..."
            [(ngModel)]="selectedParentId"
          >
            <hlm-select-trigger class="w-full">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content class="bg-white dark:bg-zinc-950">
              <hlm-option *ngFor="let node of candidates" [value]="node.id">
                {{ node.name }} ({{ node.section || 'General' }})
              </hlm-option>
            </hlm-select-content>
          </brn-select>
        </div>
      </div>

      <hlm-dialog-footer>
        <button type="button" hlmBtn variant="outline" (click)="onClose()">Cancel</button>
        <button type="button" hlmBtn (click)="onSubmit()" [disabled]="!selectedParentId">
          Confirm
        </button>
      </hlm-dialog-footer>
    </hlm-dialog-content>
  `,
})
export class SelectParentDialogComponent {
  @Input() candidates: WorkerNode[] = [];
  @Output() parentSelected = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  selectedParentId: string | null = null;

  onSubmit() {
    if (this.selectedParentId) {
      this.parentSelected.emit(this.selectedParentId);
      this.selectedParentId = null;
    }
  }

  onClose() {
    this.cancel.emit();
    this.selectedParentId = null;
  }
}
