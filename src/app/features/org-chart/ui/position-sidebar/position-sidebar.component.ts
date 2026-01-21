import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragRelease, DragDropModule } from '@angular/cdk/drag-drop';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLayoutGrid, lucidePlus, lucideX } from '@ng-icons/lucide';
import { PositionItem } from '../../data-access/org.model';
import { PositionItemComponent } from '../position-item/position-item.component';

@Component({
  selector: 'app-position-sidebar',
  standalone: true,
  imports: [CommonModule, DragDropModule, HlmButton, NgIconComponent, PositionItemComponent],
  providers: [provideIcons({ lucideLayoutGrid, lucidePlus, lucideX })],
  template: `
    <aside
      id="position-sidebar"
      class="flex h-full w-80 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 shadow-xl"
    >
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold">
          <ng-icon name="lucideLayoutGrid"></ng-icon>
          Positions
        </h2>
        <div class="flex items-center gap-2">
          <button
            id="sidebar-add-btn"
            hlmBtn
            variant="outline"
            size="sm"
            (click)="addPosition.emit()"
          >
            <ng-icon name="lucidePlus" size="16"></ng-icon>
          </button>
          <button hlmBtn variant="ghost" size="sm" (click)="close.emit()">
            <ng-icon name="lucideX" size="16"></ng-icon>
          </button>
        </div>
      </div>

      <p class="text-xs text-muted-foreground">Drag positions from here to add new nodes.</p>

      <div
        cdkDropList
        [cdkDropListData]="positions"
        class="flex min-h-25 flex-col gap-2"
        (cdkDropListDropped)="onDrop($event)"
      >
        <app-position-item
          *ngFor="let item of positions"
          [item]="item"
          cdkDrag
          [cdkDragData]="item"
          (cdkDragReleased)="onDragReleased($event, item)"
          (edit)="editPosition.emit($event)"
        ></app-position-item>
      </div>
    </aside>
  `,
})
export class PositionSidebarComponent {
  @Input({ required: true }) positions: PositionItem[] = [];

  @Output() addPosition = new EventEmitter<void>();
  @Output() editPosition = new EventEmitter<PositionItem>();
  @Output() reorder = new EventEmitter<{ previousIndex: number; currentIndex: number }>();
  @Output() close = new EventEmitter<void>();
  @Output() dragReleased = new EventEmitter<{ item: PositionItem; event: CdkDragRelease }>();

  onDrop(event: CdkDragDrop<PositionItem[]>) {
    if (event.previousContainer === event.container) {
      this.reorder.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
      });
    }
  }

  onDragReleased(event: CdkDragRelease, item: PositionItem) {
    this.dragReleased.emit({ item, event });
  }
}
