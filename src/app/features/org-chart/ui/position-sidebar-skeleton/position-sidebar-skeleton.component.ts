import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLayoutGrid, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-position-sidebar-skeleton',
  standalone: true,
  imports: [CommonModule, HlmSkeletonImports, NgIconComponent, HlmButton],
  providers: [provideIcons({ lucideLayoutGrid, lucidePlus })],
  template: `
    <aside
      class="flex h-full w-80 flex-col gap-4 overflow-y-auto border-r border-border bg-card p-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold">
          <ng-icon name="lucideLayoutGrid"></ng-icon>
          Positions
        </h2>
        <button hlmBtn variant="outline" size="sm" disabled>
          <ng-icon name="lucidePlus" size="16"></ng-icon>
        </button>
      </div>

      <p class="text-xs text-muted-foreground">Drag positions from here to add new nodes.</p>

      <div class="flex flex-col gap-2">
        <!-- Skeleton Items -->
        <div
          *ngFor="let i of [1, 2, 3, 4, 5]"
          class="flex flex-row items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
        >
          <div class="flex w-full items-center gap-3">
            <!-- Grip Handle -->
            <hlm-skeleton class="h-4 w-4 rounded bg-muted" />
            <div class="flex w-full flex-col gap-2">
              <!-- Name -->
              <hlm-skeleton class="h-4 w-3/4 rounded bg-muted" />
              <!-- Code -->
              <hlm-skeleton class="h-3 w-1/3 rounded bg-muted" />
            </div>
          </div>
          <!-- Edit Button -->
          <hlm-skeleton class="h-8 w-8 shrink-0 rounded-md bg-muted" />
        </div>
      </div>
    </aside>
  `,
})
export class PositionSidebarSkeletonComponent {}
