import { Component } from "@angular/core";
import { NativestorageService } from "../../imisa-services/nativestorage.service";
import { CommonService } from "../../imisa-services/common.service";
import { InventoryHeader, InventoryItem } from "../../models/inventory";

@Component({
  selector: "app-inventory",
  templateUrl: "./inventory.page.html",
  styleUrls: ["./inventory.page.scss"],
  standalone: false,
})
export class InventoryPage {
  private readonly INVENTORY_HEADER_KEY = "inventory_header";
  private readonly INVENTORY_ITEMS_KEY = "inventory_items";

  header: InventoryHeader = null;
  items: InventoryItem[] = [];

  constructor(
    private native: NativestorageService,
    private common: CommonService
  ) {}

  async ionViewWillEnter() {
    await this.loadInventory();
  }

  private async loadInventory() {
    try {
      this.header =
        (await this.native.getNativeValue(this.INVENTORY_HEADER_KEY)) || null;
      const arr =
        (await this.native.getNativeValue(this.INVENTORY_ITEMS_KEY)) || [];
      this.items = Array.isArray(arr) ? arr : [];
      if (!this.header || this.items.length === 0) {
        await this.common.showAlertMessage(
          "Keine lokalen Inventurdaten. Bitte zuerst 'Inventur holen (GET)' ausführen.",
          "iMisa"
        );
      }
    } catch (e) {
      await this.common.showErrorMessage(
        "Fehler beim Lesen der Inventurdaten."
      );
    }
  }
}
