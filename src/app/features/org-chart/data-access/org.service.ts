import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { OrgState } from './org.model';

@Injectable({
  providedIn: 'root',
})
export class OrgService {
  getOrgChart(): Observable<Partial<OrgState>> {
    const mockData: Partial<OrgState> = {
      rootIds: ['100'],
      nodeMap: {
        '100': {
          id: '100',
          name: 'CEO',
          section: 'Management',
          salaryType: 'Management',
          parentId: null,
          childrenIds: ['200', '300'],
          level: 1,
          isExpanded: true,
        },
        '200': {
          id: '200',
          name: 'CTO',
          section: 'IT',
          salaryType: 'Management',
          parentId: '100',
          childrenIds: [],
          level: 2,
          isExpanded: true,
        },
        '300': {
          id: '300',
          name: 'CFO',
          section: 'Finance',
          salaryType: 'Management',
          parentId: '100',
          childrenIds: [],
          level: 2,
          isExpanded: true,
        },
      },
    };
    return of(mockData).pipe(delay(500));
  }
}
