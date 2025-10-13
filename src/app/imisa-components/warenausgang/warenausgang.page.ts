import { Component } from "@angular/core";

@Component({
  selector: "app-warenausgang",
  templateUrl: "./warenausgang.page.html",
  styleUrls: ["./warenausgang.page.scss"],
  standalone: false,
})
export class WarenausgangPage {
  // TODO (impl futura):
  // - Reutilizar patrón Order (lista/detalle)
  // - Campos extra: Leistungsdatum, Medizinisch indiziert
  // - Scan QR con formato StoragePlaceID#ProcCatCode
  // - Duplicado de líneas por cantidad parcial, deshacer/confirmar
}
