import { Component } from "@angular/core";

@Component({
  selector: "app-inventory",
  templateUrl: "./inventory.page.html",
  styleUrls: ["./inventory.page.scss"],
  standalone: false,
})
export class InventoryPage {
  // TODO (impl futura):
  // - Toggle "solo no confirmados", lista de ítems, detalle con QtyReal
  // - Botón "Nächster Artikel"
  // - Integrar CameraScannerComponent para buscar por ArticleNr/SearchCode3
}
