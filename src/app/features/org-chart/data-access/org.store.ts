import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

// ต้องใส่ withState({}) เป็นอย่างน้อยครับ ห้ามปล่อยว่าง
export const OrgStore = signalStore(withState({}));
