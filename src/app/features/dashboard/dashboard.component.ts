import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../../core/tour/tour.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container px-4 pt-20 pb-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h1 id="dashboard-title" class="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div
            id="stat-card-total"
            class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm dark:shadow-none"
          >
            <div class="text-sm font-medium text-muted-foreground">Total Employees</div>
            <div class="mt-2 text-2xl font-bold">1,234</div>
            <div class="mt-1 text-xs text-muted-foreground">+20.1% from last month</div>
          </div>
          <div
            class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm dark:shadow-none"
          >
            <div class="text-sm font-medium text-muted-foreground">Departments</div>
            <div class="mt-2 text-2xl font-bold">15</div>
          </div>
          <div
            class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm dark:shadow-none"
          >
            <div class="text-sm font-medium text-muted-foreground">Active Roles</div>
            <div class="mt-2 text-2xl font-bold">42</div>
          </div>
          <div
            class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm dark:shadow-none"
          >
            <div class="text-sm font-medium text-muted-foreground">Pending Reviews</div>
            <div class="mt-2 text-2xl font-bold">7</div>
          </div>
        </div>

        <div
          id="chart-overview"
          class="flex min-h-100 items-center justify-center rounded-xl border border-dashed bg-muted/50"
        >
          <div class="text-muted-foreground">Chart Overview Placeholder</div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private tourService = inject(TourService);

  ngOnInit() {
    this.tourService.activateTour('dashboard');
  }
}
