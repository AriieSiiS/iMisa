export interface WarenausgangLine {
  storagePlaceId: number; // Lagerort (del QR o manual)
  procCatCode: number; // Artikel/Prozedur-Kategorie-Code (del QR o manual)
  qty: number; // Menge
  leistungsdatum?: string; // ISO date (yyyy-MM-dd)
  medizinischIndiziert?: boolean; // flag
}
