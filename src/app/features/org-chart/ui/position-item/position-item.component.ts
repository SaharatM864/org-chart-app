import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { PositionItem } from '../../data-access/org.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideGripVertical, lucidePencil } from '@ng-icons/lucide';

@Component({
  selector: 'app-position-item',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    CdkDragHandle,
    ...HlmCardImports,
    NgIconComponent,
    ...HlmButtonImports,
  ],
  providers: [provideIcons({ lucideGripVertical, lucidePencil })],
  template: `
    <div
      hlmCard
      class="flex flex-row items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/50 hover:shadow-md"
    >
      <div class="flex items-center gap-3">
        <ng-icon
          cdkDragHandle
          name="lucideGripVertical"
          class="cursor-grab text-muted-foreground active:cursor-grabbing"
        ></ng-icon>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-foreground">{{ item.name }}</span>
          <span class="text-xs text-muted-foreground">{{ item.code }}</span>
        </div>
      </div>

      <button
        hlmBtn
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        (mousedown)="$event.stopPropagation()"
        (click)="onEdit($event)"
      >
        <ng-icon name="lucidePencil" size="14"></ng-icon>
      </button>
    </div>
  `,
})
export class PositionItemComponent {
  @Input({ required: true }) item!: PositionItem;
  @Output() edit = new EventEmitter<PositionItem>();

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.edit.emit(this.item);
  }
}
