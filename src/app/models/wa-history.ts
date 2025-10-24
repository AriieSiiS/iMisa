export interface WarenausgangHistoryEntry {
  id: string; // uid local
  createdAtIso: string; // ISO timestamp
  storagePlaceId: number | null; // Lagerort usado (si homogéneo; si no, null)
  totalLines: number; // nº líneas
  totalQty: number; // suma qty
  payload: any; // copia del payload enviado
  lines: Array<{
    storagePlaceId: number;
    procCatCode: number;
    qty: number;
    leistungsdatum: string | null;
    medizinischIndiziert: boolean;
  }>;
}
