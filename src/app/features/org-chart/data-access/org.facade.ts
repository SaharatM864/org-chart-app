import { inject, Injectable } from '@angular/core';
import { OrgStore } from './org.store';
import { MoveNodePayload, PositionItem } from './org.model';

@Injectable({
  providedIn: 'root',
})
export class OrgFacade {
  private store = inject(OrgStore);

  viewTree = this.store.viewTree;
  isLoading = this.store.isLoading;
  error = this.store.error;
  sidebarPositions = this.store.sidebarPositions;
  allDropListIds = this.store.allDropListIds;

  loadChart(): void {
    this.store.loadChart();
  }

  addNode(parentId: string | null, position: PositionItem): void {
    this.store.addNode(parentId, position);
  }

  moveNode(payload: MoveNodePayload): void {
    this.store.moveNode(payload);
  }

  deleteNode(nodeId: string, promoteChildren: boolean): void {
    this.store.deleteNode(nodeId, promoteChildren);
  }
}
