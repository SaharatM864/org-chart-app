import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative min-h-[150vh] w-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white"
    >
      <div
        class="animate-blob fixed top-20 left-10 h-32 w-32 rounded-full bg-yellow-400 opacity-70 mix-blend-multiply blur-xl filter"
      ></div>
      <div
        class="animate-blob animation-delay-2000 fixed top-20 right-10 h-32 w-32 rounded-full bg-pink-400 opacity-70 mix-blend-multiply blur-xl filter"
      ></div>

      <div class="mx-auto max-w-4xl space-y-8 pt-10">
        <div class="space-y-4">
          <h1 class="text-5xl font-bold">Glass Navbar Test</h1>
          <p class="text-xl opacity-90">
            Tailwind v4 is working correctly! Scroll down to see the blur effect on the navbar.
          </p>
          <div
            class="inline-block rounded-lg border border-white/20 bg-black/20 p-4 backdrop-blur-sm"
          >
            Verified: defaults to "org-chart" route
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            class="h-64 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md"
          >
            <h3 class="mb-2 text-xl font-bold">Card 1</h3>
            <p class="opacity-80">This card also uses glassmorphism.</p>
          </div>
          <div
            class="h-64 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md"
          >
            <h3 class="mb-2 text-xl font-bold">Card 2</h3>
            <p class="opacity-80">Scroll up and down to check the sticky header blur.</p>
          </div>
        </div>

        <div class="space-y-4">
          <div
            *ngFor="let i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
            class="flex h-24 items-center rounded-lg border border-white/10 bg-white/5 px-6"
          >
            Scroll Item {{ i }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChartViewComponent {}
