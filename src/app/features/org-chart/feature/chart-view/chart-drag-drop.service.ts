import { Injectable } from '@angular/core';
import { CdkDragRelease } from '@angular/cdk/drag-drop';

export type DropTarget =
  | { type: 'node'; nodeId: string }
  | { type: 'background' }
  | { type: 'invalid' };

@Injectable({
  providedIn: 'root',
})
export class ChartDragDropService {
  handleDragReleased(event: CdkDragRelease, mainDropZone: HTMLElement | null): DropTarget {
    const mouseEvent = event.event;
    let x, y;

    if (mouseEvent instanceof MouseEvent) {
      x = mouseEvent.clientX;
      y = mouseEvent.clientY;
    } else if (window.TouchEvent && mouseEvent instanceof TouchEvent) {
      x = mouseEvent.changedTouches[0].clientX;
      y = mouseEvent.changedTouches[0].clientY;
    } else {
      return { type: 'invalid' };
    }

    const elementAtPoint = document.elementFromPoint(x, y);

    if (
      mainDropZone &&
      (mainDropZone.contains(elementAtPoint) || mainDropZone === elementAtPoint)
    ) {
      // Valid drop!

      // 1. Run Animation
      this.runDropAnimation();

      // 2. Prevent CDK Return Animation (by hiding the preview)
      const preview = document.querySelector('.cdk-drag-preview') as HTMLElement;
      if (preview) {
        preview.style.opacity = '0';
        preview.style.display = 'none'; // Force hide
      }

      // 3. Determine Target
      return this.determineDropTarget(x, y);
    }

    return { type: 'invalid' };
  }

  private determineDropTarget(x: number, y: number): DropTarget {
    const element = document.elementFromPoint(x, y);
    const nodeElement = element?.closest('[data-node-id]');

    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-node-id');
      if (nodeId) {
        return { type: 'node', nodeId };
      }
    }

    return { type: 'background' };
  }

  private runDropAnimation() {
    const preview = document.querySelector('.cdk-drag-preview') as HTMLElement;
    if (preview) {
      const clone = preview.cloneNode(true) as HTMLElement;
      const rect = preview.getBoundingClientRect();

      clone.style.position = 'fixed';
      clone.style.top = `${rect.top}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.zIndex = '1000';
      clone.style.transition = 'all 0.3s ease-out';
      clone.style.pointerEvents = 'none';
      clone.style.margin = '0';
      clone.style.boxSizing = 'border-box';

      const computedStyle = window.getComputedStyle(preview);
      clone.style.borderRadius = computedStyle.borderRadius;
      clone.style.backgroundColor = computedStyle.backgroundColor;
      clone.style.boxShadow = computedStyle.boxShadow;

      document.body.appendChild(clone);

      // Force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      clone.offsetHeight;

      clone.style.transform = 'scale(0)';
      clone.style.opacity = '0';

      setTimeout(() => {
        clone.remove();
      }, 300);
    }
  }
}
