import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeCardSkeletonComponent } from '../node-card-skeleton/node-card-skeleton.component';

@Component({
  selector: 'app-chart-view-skeleton',
  standalone: true,
  imports: [CommonModule, NodeCardSkeletonComponent],
  template: `
    <div class="flex h-full w-full flex-col items-center justify-center gap-12 overflow-hidden p-8">
      <!-- Root Node Skeleton -->
      <div class="relative flex flex-col items-center">
        <app-node-card-skeleton />
        <!-- Vertical Line from Root -->
        <div class="absoulte -bottom-8 h-8 w-0.5 bg-border"></div>
      </div>

      <!-- Level 2 Container -->
      <div class="relative flex items-start gap-16">
        <!-- Horizontal Connector Line (Simplified) -->
        <div
          class="absolute -top-4 right-28 left-28 h-4 rounded-t-xl border-t-2 border-r-2 border-l-2 border-border"
        ></div>

        <!-- Child 1 -->
        <div class="relative flex flex-col items-center">
          <div class="absolute -top-4 h-4 w-0.5 bg-border"></div>
          <app-node-card-skeleton />
          <div class="absolute -bottom-8 h-8 w-0.5 bg-border"></div>
          <!-- Grandchildren Container -->
          <div class="mt-8 flex gap-8">
            <div class="relative">
              <div class="absolute -top-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-border"></div>
              <!-- Connector -->
              <app-node-card-skeleton />
            </div>
            <div class="relative">
              <div class="absolute -top-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-border"></div>
              <!-- Connector -->
              <app-node-card-skeleton />
            </div>
          </div>
        </div>

        <!-- Child 2 -->
        <div class="relative flex flex-col items-center">
          <div class="absolute -top-4 h-4 w-0.5 bg-border"></div>
          <app-node-card-skeleton />
        </div>

        <!-- Child 3 -->
        <div class="relative flex flex-col items-center">
          <div class="absolute -top-4 h-4 w-0.5 bg-border"></div>
          <app-node-card-skeleton />
        </div>
      </div>
    </div>
  `,
})
export class ChartViewSkeletonComponent {}
