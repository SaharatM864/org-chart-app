import { Injectable } from '@angular/core';
import { driver, Driver, DriveStep } from 'driver.js';
import { Subject } from 'rxjs';
import { DEFAULT_DRIVER_CONFIG } from './tour.config';
import { TOUR_STEPS } from './tour.steps';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private driverObj: Driver;
  private activeTourKey?: string;

  // Subject to notify when a step starts highlighting
  private stepStartSource = new Subject<string | undefined>();
  stepStart$ = this.stepStartSource.asObservable();

  // Subject to notify when a step needs preparation (before transition)
  private prepareStepSource = new Subject<string>();
  prepareStep$ = this.prepareStepSource.asObservable();

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
   * Manually move to the next step
   */
  moveNext() {
    this.driverObj.moveNext();
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

    const stepsRaw = TOUR_STEPS[targetKey];
    if (!stepsRaw || stepsRaw.length === 0) {
      console.warn(`No tour steps defined for key: ${targetKey}`);
      return;
    }

    // Find the index of "Delete Node" step to intercept its predecessor
    const deleteNodeStepIndex = stepsRaw.findIndex((s) => s.element === '.tour-node-delete-btn');

    // Intercept steps to emit events and handle transitions
    const steps = stepsRaw.map((step, index) => {
      // Keep original callbacks
      const originalOnHighlightStarted = step.onHighlightStarted;
      const originalOnNextClick = step.popover?.onNextClick;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newStep: any = {
        ...step,
        onHighlightStarted: (
          element?: Element,
          stepObj?: DriveStep,
          options?: { config: unknown; state: unknown },
        ) => {
          this.stepStartSource.next(step.element as string);

          if (originalOnHighlightStarted) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            originalOnHighlightStarted(element, stepObj as any, options as any);
          }
        },
      };

      // If this is the step BEFORE "Delete Node", intercept Next click
      if (deleteNodeStepIndex !== -1 && index === deleteNodeStepIndex - 1) {
        // Ensure popover exists
        newStep.popover = {
          ...step.popover,
          onNextClick: (
            element?: Element,
            stepObj?: DriveStep,
            options?: { config: unknown; state: unknown },
          ) => {
            // Emit "Delete Node" selector to request preparation
            const nextStepSelector = stepsRaw[deleteNodeStepIndex].element as string;
            this.prepareStepSource.next(nextStepSelector);

            // DO NOT CALL moveNext() here. The subscriber (component) will call it after animation.
            if (originalOnNextClick) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              originalOnNextClick(element, stepObj as any, options as any);
            }
          },
        };
      }

      return newStep;
    });

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
