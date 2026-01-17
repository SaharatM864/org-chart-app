import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HlmDialogContent,
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmLabel } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { PositionFormData, WorkerNode } from '../../data-access/org.model';

@Component({
  selector: 'app-edit-node-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmInput,
    HlmButton,
    HlmLabel,
    BrnSelectImports,
    HlmSelectImports,
  ],
  template: `
    <hlm-dialog-content class="sm:max-w-125">
      <hlm-dialog-header>
        <h3 hlmDialogTitle>Edit Employee</h3>
        <p hlmDialogDescription>Update the employee details.</p>
      </hlm-dialog-header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label hlmLabel for="name">Name (EN)</label>
          <input hlmInput id="name" formControlName="name" placeholder="e.g. John Doe" />
        </div>

        <div class="grid gap-2">
          <label hlmLabel for="nameTh">Name (TH)</label>
          <input hlmInput id="nameTh" formControlName="nameTh" placeholder="e.g. จอห์น โด" />
        </div>

        <div class="grid gap-2">
          <label hlmLabel for="nameZh">Name (CN)</label>
          <input hlmInput id="nameZh" formControlName="nameZh" placeholder="e.g. 约翰·多" />
        </div>

        <div class="grid gap-2">
          <label hlmLabel for="nameVi">Name (VN)</label>
          <input hlmInput id="nameVi" formControlName="nameVi" placeholder="e.g. John Doe" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <label hlmLabel for="section">Section</label>
            <input hlmInput id="section" formControlName="section" placeholder="IT" />
          </div>
          <div class="grid gap-2">
            <label hlmLabel for="salaryType">Salary Type</label>
            <brn-select
              id="salaryType"
              formControlName="salaryType"
              placeholder="Select salary type"
            >
              <hlm-select-trigger class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content class="bg-white dark:bg-zinc-950">
                <hlm-option value="Normal">Normal</hlm-option>
                <hlm-option value="Management">Management</hlm-option>
                <hlm-option value="Admin">Admin</hlm-option>
              </hlm-select-content>
            </brn-select>
          </div>
        </div>

        <hlm-dialog-footer>
          <button type="button" hlmBtn variant="outline" (click)="onClose()">Cancel</button>
          <button type="submit" hlmBtn [disabled]="form.invalid">Save Changes</button>
        </hlm-dialog-footer>
      </form>
    </hlm-dialog-content>
  `,
})
export class EditNodeDialogComponent {
  private fb = inject(FormBuilder);

  @Input({ required: true })
  set node(value: WorkerNode) {
    if (value) {
      this.form.patchValue({
        name: value.name,
        nameTh: value.nameTh || '',
        nameZh: value.nameZh || '',
        nameVi: value.nameVi || '',
        section: value.section || '',
        salaryType: value.salaryType || 'Normal',
      });
    }
  }

  @Output() formSubmit = new EventEmitter<PositionFormData>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.group({
    name: ['', Validators.required],
    nameTh: [''],
    nameZh: [''],
    nameVi: [''],
    section: [''],
    salaryType: ['Normal', Validators.required],
  });

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as unknown as PositionFormData);
    }
  }

  onClose() {
    this.cancel.emit();
  }
}
