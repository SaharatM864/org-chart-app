import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'app-node-card-skeleton',
  standalone: true,
  imports: [CommonModule, HlmSkeletonImports],
  template: `
    <div
      class="relative flex w-56 flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm backdrop-blur-sm"
    >
      <div class="flex items-start gap-4">
        <!-- Avatar Skeleton -->
        <hlm-skeleton class="size-10 shrink-0 rounded-full bg-muted" />

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <!-- Name Skeleton -->
          <hlm-skeleton class="h-4 w-3/4 rounded-md bg-muted" />
          <!-- Position/Section Skeleton -->
          <hlm-skeleton class="h-3 w-1/2 rounded-md bg-muted" />
          <!-- TH Name Skeleton (Optional but keeps layout structure) -->
          <hlm-skeleton class="h-2 w-1/3 rounded-md bg-muted" />
        </div>
      </div>

      <div
        class="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-muted-foreground/80"
      >
        <!-- Level Badge Skeleton -->
        <hlm-skeleton class="h-5 w-12 rounded-full bg-muted" />
        <!-- Salary Type Skeleton -->
        <hlm-skeleton class="h-3 w-10 rounded-full bg-muted" />
      </div>
    </div>
  `,
})
export class NodeCardSkeletonComponent {}
