import { Component } from "@angular/core";
import { NativestorageService } from "../../imisa-services/nativestorage.service";
import { CommonService } from "../../imisa-services/common.service";
import { InventoryHeader, InventoryItem } from "../../models/inventory";

@Component({
  selector: "app-inventory-transfer",
  templateUrl: "./inventory-transfer.page.html",
  styleUrls: ["./inventory-transfer.page.scss"],
  standalone: false,
})
export class InventoryTransferPage {
  private readonly INVENTORY_HEADER_KEY = "inventory_header";
  private readonly INVENTORY_ITEMS_KEY = "inventory_items";

  constructor(
    private native: NativestorageService,
    private common: CommonService
  ) {}

  // --- MODO PRUEBA: dataset mínimo local (simula JSON de receive del PDF)
  // Nota: ajusta libremente los valores si quieres más líneas.
  private buildMockInventory(): {
    header: InventoryHeader;
    items: InventoryItem[];
  } {
    const header: InventoryHeader = {
      MawiMoveID: 12345,
      StorageUnitID: 10,
      StorageUnitIDDesc: "Schublade 1A",
    };

    const items: InventoryItem[] = [
      {
        Code: 100045,
        DescInternalGe:
          "ASPIRIN CARDIO Filmtabl 100 mg 1 Stk (28) [Acetylsalicylsäure]",
        SearchCode: "",
        StoragePlaceID: 10,
        StoragePlaceIDDesc: "Schublade 1A",
        QtyExpected: 28.0,
        QtyReal: null,
        PosNr: 1,
      },
      {
        Code: 200010,
        DescInternalGe: "Paracetamol 1g Tbl. (10)",
        SearchCode: "PARA1G",
        StoragePlaceID: 10,
        StoragePlaceIDDesc: "Schublade 1A",
        QtyExpected: 10.0,
        QtyReal: null,
        PosNr: 2,
      },
    ];

    return { header, items };
  }

  async doGetMock() {
    try {
      await this.common.showLoader("Inventur wird vorbereitet...");
      const { header, items } = this.buildMockInventory();
      await this.native.setNativeValue(this.INVENTORY_HEADER_KEY, header);
      await this.native.setNativeValue(this.INVENTORY_ITEMS_KEY, items);
      await this.common.hideLoader();
      await this.common.showMessage("Inventur (Mock) geladen.");
    } catch (e) {
      await this.common.hideLoader();
      await this.common.showErrorMessage(
        "Fehler beim lokalen Laden der Inventur."
      );
    }
  }

  async doSendMock() {
    try {
      // Validación mínima: comprobar si hay algo que enviar
      const items: InventoryItem[] =
        (await this.native.getNativeValue(this.INVENTORY_ITEMS_KEY)) || [];
      if (!Array.isArray(items) || items.length === 0) {
        await this.common.showAlertMessage(
          "Keine Inventur-Daten vorhanden.",
          "iMisa"
        );
        return;
      }

      await this.common.showLoader("Inventur wird gesendet...");
      // Simula éxito de envío:
      await this.native.setNativeValue(this.INVENTORY_HEADER_KEY, null);
      await this.native.setNativeValue(this.INVENTORY_ITEMS_KEY, []);
      await this.common.hideLoader();
      await this.common.showMessage("Inventur (Mock) gesendet und gelöscht.");
    } catch (e) {
      await this.common.hideLoader();
      await this.common.showErrorMessage(
        "Fehler beim lokalen Senden der Inventur."
      );
    }
  }
}
