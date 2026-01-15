import { Component } from '@angular/core';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  template: `
    <div class="flex h-full flex-col">
      <div class="mb-4 flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Organization Chart</h2>
        <div class="flex items-center space-x-2">
          <!-- Toolbar placeholders -->
          <button
            class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Node
          </button>
          <button
            class="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Canvas Area -->
      <div
        class="group relative flex-1 overflow-hidden rounded-xl border border-dashed bg-muted/30"
      >
        <!-- Dot Grid Background -->
        <div
          class="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black)]"
        >
          <div
            class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:16px_16px]"
          ></div>
        </div>

        <div class="absolute inset-0 flex items-center justify-center">
          <div class="max-w-sm rounded-lg border bg-background p-6 text-center shadow-lg">
            <h3 class="mb-2 text-lg font-semibold">Interactive Chart</h3>
            <p class="text-sm text-muted-foreground">
              Drag and drop functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChartViewComponent {}
