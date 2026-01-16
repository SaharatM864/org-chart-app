import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { BrnTooltipImports } from '@spartan-ng/brain/tooltip';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideMinus,
  lucideRotateCcw,
  lucideMove,
  lucideArrowRightLeft,
  lucideMap,
  lucideChevronsDown,
  lucideChevronsUp,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-chart-toolbar',
  standalone: true,
  imports: [CommonModule, HlmButton, HlmTooltipImports, BrnTooltipImports, NgIconComponent],
  providers: [
    provideIcons({
      lucidePlus,
      lucideMinus,
      lucideRotateCcw,
      lucideMove,
      lucideArrowRightLeft,
      lucideMap,
      lucideChevronsDown,
      lucideChevronsUp,
    }),
  ],
  template: `
    <div class="glass-panel flex flex-col gap-1 rounded-lg border border-border/50 p-1 shadow-sm">
      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="zoomIn.emit()"
        >
          <ng-icon name="lucidePlus" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Zoom In </span>
      </hlm-tooltip>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="zoomOut.emit()"
        >
          <ng-icon name="lucideMinus" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Zoom Out </span>
      </hlm-tooltip>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="resetView.emit()"
        >
          <ng-icon name="lucideRotateCcw" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Reset View </span>
      </hlm-tooltip>

      <div class="my-1 h-px bg-border"></div>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="toggleDragAndDrop.emit()"
          [class.bg-accent]="isDraggable"
        >
          <ng-icon name="lucideMove" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip">
          {{ isDraggable ? 'Disable Drag & Drop' : 'Enable Drag & Drop' }}
        </span>
      </hlm-tooltip>

      <div class="my-1 h-px bg-border"></div>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="switchLayout.emit()"
        >
          <ng-icon
            name="lucideArrowRightLeft"
            size="18"
            [class.rotate-90]="layoutDirection === 'vertical'"
          ></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Toggle Layout </span>
      </hlm-tooltip>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="toggleMiniMap.emit()"
          [class.bg-accent]="showMiniMap"
        >
          <ng-icon name="lucideMap" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Toggle Mini Map </span>
      </hlm-tooltip>

      <div class="my-1 h-px bg-border"></div>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="expandAll.emit()"
        >
          <ng-icon name="lucideChevronsDown" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Expand All </span>
      </hlm-tooltip>

      <hlm-tooltip class="block">
        <button
          hlmTooltipTrigger
          position="left"
          [showDelay]="300"
          [hideDelay]="200"
          [exitAnimationDuration]="300"
          hlmBtn
          variant="ghost"
          size="icon"
          (click)="collapseAll.emit()"
        >
          <ng-icon name="lucideChevronsUp" size="18"></ng-icon>
        </button>
        <span *brnTooltipContent class="side-tooltip"> Collapse All </span>
      </hlm-tooltip>
    </div>
  `,
  styles: [
    `
      .side-tooltip {
        position: relative;
        display: flex;
        align-items: center;
      }
      .side-tooltip::after {
        content: '';
        position: absolute;
        top: 50%;
        right: -8px;
        transform: translateY(-50%) rotate(-90deg);
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent transparent transparent;
      }
    `,
  ],
})
export class ChartToolbarComponent {
  @Input() isDraggable = true;
  @Input() showMiniMap = false;
  @Input() layoutDirection: 'vertical' | 'horizontal' = 'vertical';

  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() resetView = new EventEmitter<void>();
  @Output() toggleDragAndDrop = new EventEmitter<void>();
  @Output() switchLayout = new EventEmitter<void>();
  @Output() toggleMiniMap = new EventEmitter<void>();
  @Output() expandAll = new EventEmitter<void>();
  @Output() collapseAll = new EventEmitter<void>();
}
