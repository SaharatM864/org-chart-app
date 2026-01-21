import { Injectable } from '@angular/core';
import { driver, Driver } from 'driver.js';
import { DEFAULT_DRIVER_CONFIG } from './tour.config';
import { TOUR_STEPS } from './tour.steps';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private driverObj: Driver;

  private activeTourKey?: string;

  constructor() {
    this.driverObj = driver(DEFAULT_DRIVER_CONFIG);
  }

  /**
   * Activate a specific tour configuration for the current view
   */
  activateTour(key: string) {
    this.activeTourKey = key;
  }

  /**
   * Start the tour. If key is provided, starts that specific tour.
   * Otherwise, starts the currently active tour.
   */
  startTour(key?: string) {
    const targetKey = key || this.activeTourKey;

    if (!targetKey) {
      console.warn('No tour key provided and no active tour set');
      return;
    }

    const steps = TOUR_STEPS[targetKey];
    if (!steps || steps.length === 0) {
      console.warn(`No tour steps defined for key: ${targetKey}`);
      return;
    }

    this.driverObj.setSteps(steps);
    this.driverObj.drive();
  }

  // Utility to highlight specific element similar to what was possible before or suggested
  highlight(element: string, popover: { title: string; description: string }) {
    this.driverObj.highlight({
      element,
      popover,
    });
  }
}
