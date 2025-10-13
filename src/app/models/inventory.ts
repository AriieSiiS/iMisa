export interface InventoryHeader {
  MawiMoveID: number;
  StorageUnitID?: number;
  StorageUnitIDDesc?: string;
}

export interface InventoryItem {
  Code: number;
  DescInternalGe: string;
  SearchCode?: string;
  StoragePlaceID: number;
  StoragePlaceIDDesc?: string;
  QtyExpected: number;
  QtyReal?: number | null;
  PosNr?: number;
}
