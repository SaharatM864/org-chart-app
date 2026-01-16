import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'app-node-card-skeleton',
  standalone: true,
  imports: [CommonModule, HlmSkeletonImports],
  template: `
    <div
      class="text-card-foreground relative flex w-56 flex-col overflow-hidden rounded-xl border border-l-[6px] border-border bg-white/95 p-4 shadow-sm dark:bg-zinc-900/95"
    >
      <div class="flex items-start gap-4">
        <!-- Avatar Skeleton -->
        <hlm-skeleton class="size-10 shrink-0 rounded-full bg-muted" />

        <div class="flex min-w-0 flex-1 flex-col gap-2">
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
        <hlm-skeleton class="h-3 w-10 rounded-md bg-muted" />
      </div>
    </div>
  `,
})
export class NodeCardSkeletonComponent {}
