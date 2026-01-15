import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { PositionItem } from '../../data-access/org.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideGripVertical } from '@ng-icons/lucide';

@Component({
  selector: 'app-position-item',
  standalone: true,
  imports: [CommonModule, DragDropModule, ...HlmCardImports, NgIconComponent],
  providers: [provideIcons({ lucideGripVertical })],
  template: `
    <div
      hlmCard
      class="bg-card flex cursor-grab items-center gap-2 rounded-lg border border-border p-3 shadow-sm hover:border-primary/50 hover:shadow-md active:cursor-grabbing"
    >
      <ng-icon name="lucideGripVertical" class="text-muted-foreground"></ng-icon>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-foreground">{{ item.name }}</span>
        <span class="text-xs text-muted-foreground">{{ item.code }}</span>
      </div>
    </div>
  `,
})
export class PositionItemComponent {
  @Input({ required: true }) item!: PositionItem;
}
