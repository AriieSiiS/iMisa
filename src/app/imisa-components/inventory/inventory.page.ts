import { Component } from "@angular/core";
import { NativestorageService } from "../../imisa-services/nativestorage.service";
import { CommonService } from "../../imisa-services/common.service";
import { InventoryHeader, InventoryItem } from "../../models/inventory";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";

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

  // Lista completa y lista visible (según filtro)
  allItems: InventoryItem[] = [];
  items: InventoryItem[] = [];

  // Estado UI
  showOnlyUnconfirmed = false;
  selectedIndex: number | null = null; // índice en 'items' (lista filtrada)
  qtyRealInput: number | null = null;

  constructor(
    private native: NativestorageService,
    private common: CommonService,
    private barcodeScanner: BarcodeScanner
  ) {}

  async ionViewWillEnter() {
    await this.loadInventory();
  }

  private isConfirmed(it: InventoryItem): boolean {
    return it.QtyReal !== null && it.QtyReal !== undefined;
  }

  private applyFilter() {
    if (this.showOnlyUnconfirmed) {
      this.items = this.allItems.filter((x) => !this.isConfirmed(x));
    } else {
      // Copia por referencia (mantenemos los mismos objetos para que persista la edición)
      this.items = [...this.allItems];
    }
    // Ajustar selección si se ha ido
    if (this.selectedIndex !== null) {
      const sel = this.items[this.selectedIndex];
      if (!sel) this.selectedIndex = null;
    }
  }

  private async loadInventory() {
    try {
      this.header =
        (await this.native.getNativeValue(this.INVENTORY_HEADER_KEY)) || null;

      const arr =
        (await this.native.getNativeValue(this.INVENTORY_ITEMS_KEY)) || [];

      this.allItems = Array.isArray(arr) ? arr : [];
      this.applyFilter();

      if (!this.header || this.allItems.length === 0) {
        await this.common.showAlertMessage(
          "Keine lokalen Inventurdaten. Bitte zuerst 'Inventur holen (GET)' ausführen.",
          "iMisa"
        );
      }
    } catch {
      await this.common.showErrorMessage(
        "Fehler beim Lesen der Inventurdaten."
      );
    }
  }

  // --- MODO PRUEBA (GET/SEND) se mantiene como en 4.2 ---
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
      await this.loadInventory();
    } catch {
      await this.common.hideLoader();
      await this.common.showErrorMessage(
        "Fehler beim lokalen Laden der Inventur."
      );
    }
  }

  async doSendMock() {
    try {
      const items: InventoryItem[] =
        (await this.native.getNativeValue(this.INVENTORY_ITEMS_KEY)) || [];
      if (!Array.isArray(items) || items.length === 0) {
        await this.common.showAlertMessage(
          "Keine Inventur-Daten vorhanden.",
          "iMisa"
        );
        return;
      }

      // Confirmación si hay no confirmados
      const nonConfirmed = items.some(
        (it) => it.QtyReal === null || it.QtyReal === undefined
      );
      if (nonConfirmed) {
        const confirmed = window.confirm(
          "iMisa\n\nEs gibt Positionen ohne bestätigte Menge. Trotzdem senden?"
        );
        if (!confirmed) return;
      }

      await this.common.showLoader("Inventur wird gesendet...");
      await this.native.setNativeValue(this.INVENTORY_HEADER_KEY, null);
      await this.native.setNativeValue(this.INVENTORY_ITEMS_KEY, []);
      await this.common.hideLoader();
      await this.common.showMessage("Inventur (Mock) gesendet und gelöscht.");
      this.selectedIndex = null;
      await this.loadInventory();
    } catch {
      await this.common.hideLoader();
      await this.common.showErrorMessage(
        "Fehler beim lokalen Senden der Inventur."
      );
    }
  }

  // --- UI: selección, edición y persistencia ---
  onToggleOnlyUnconfirmedChanged() {
    this.applyFilter();
    // Si activamos el filtro y no hay selección, seleccionar el primero no confirmado (si existe)
    if (
      this.showOnlyUnconfirmed &&
      this.selectedIndex === null &&
      this.items.length > 0
    ) {
      this.selectItem(0);
    }
  }

  selectItem(index: number) {
    this.selectedIndex = index;
    const it = this.items[this.selectedIndex];
    this.qtyRealInput =
      it?.QtyReal !== null && it?.QtyReal !== undefined
        ? Number(it.QtyReal)
        : null;
  }

  async saveQtyReal() {
    if (this.selectedIndex === null) return;

    const it = this.items[this.selectedIndex];
    if (!it) return;

    // Normalizar valor
    let val: number | null = this.qtyRealInput as any;
    if (val === null || val === undefined || val === ("" as any)) {
      it.QtyReal = null;
    } else {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        await this.common.showAlertMessage(
          "Ungültige Menge. Bitte eine Zahl ≥ 0 eingeben.",
          "iMisa"
        );
        return;
      }
      it.QtyReal = num;
    }

    // Persistir (guardamos la lista completa)
    try {
      await this.native.setNativeValue(this.INVENTORY_ITEMS_KEY, this.allItems);
      // Reaplicar filtro (puede desaparecer de la vista si está en modo "solo no confirmados" y pasó a confirmado)
      const wasOnlyUnconf = this.showOnlyUnconfirmed;
      const currentRef = it;
      this.applyFilter();

      // Buscar el mismo objeto en la nueva 'items'
      const newIndex = this.items.indexOf(currentRef);
      if (newIndex !== -1) {
        this.selectedIndex = newIndex;
      } else {
        // Si estamos filtrando solo no confirmados y el item pasó a confirmado, saltar al siguiente no confirmado
        if (wasOnlyUnconf) {
          this.gotoNextUnconfirmed();
        } else {
          // Si no hay filtro, mantener selección en el mismo índice si existe
          if (this.items.length > 0) {
            this.selectedIndex = Math.min(
              this.selectedIndex ?? 0,
              this.items.length - 1
            );
          } else {
            this.selectedIndex = null;
          }
        }
      }
    } catch {
      await this.common.showErrorMessage("Fehler beim Speichern der Menge.");
    }
  }

  async gotoNext() {
    // Política: si hay no confirmados, priorizar el siguiente no confirmado; si no, ir al siguiente de la lista (con wrap)
    if (this.gotoNextUnconfirmed()) return;

    // Si no hay no confirmados, ir al siguiente de la lista visible
    if (this.items.length === 0) return;
    if (this.selectedIndex === null) {
      this.selectItem(0);
      return;
    }
    const next = (this.selectedIndex + 1) % this.items.length;
    this.selectItem(next);
  }

  private gotoNextUnconfirmed(): boolean {
    // Buscar siguiente no confirmado en 'allItems' (para no depender del filtro)
    if (!this.allItems || this.allItems.length === 0) return false;

    // Tomar referencia del seleccionado para localizar su índice global
    const current =
      this.selectedIndex !== null ? this.items[this.selectedIndex] : null;
    const currentGlobalIndex = current ? this.allItems.indexOf(current) : -1;

    // Buscar desde el siguiente
    const start = currentGlobalIndex >= 0 ? currentGlobalIndex + 1 : 0;
    let found: InventoryItem | null = null;

    for (let i = 0; i < this.allItems.length; i++) {
      const idx = (start + i) % this.allItems.length;
      const it = this.allItems[idx];
      if (!this.isConfirmed(it)) {
        found = it;
        break;
      }
    }

    if (!found) return false;

    // Asegurar que esté en la lista visible según el filtro
    this.applyFilter();
    const visibleIndex = this.items.indexOf(found);
    if (visibleIndex !== -1) {
      this.selectItem(visibleIndex);
      return true;
    } else {
      // Si no se ve por el filtro, activar filtro "solo no confirmados" y seleccionarlo
      this.showOnlyUnconfirmed = true;
      this.applyFilter();
      const vi2 = this.items.indexOf(found);
      if (vi2 !== -1) {
        this.selectItem(vi2);
        return true;
      }
    }
    return false;
  }

  async scanAndOpen() {
    try {
      const result = await this.barcodeScanner.scan({
        showFlipCameraButton: true,
        showTorchButton: true,
        prompt: "Artikel-Barcode scannen",
        resultDisplayDuration: 0,
        formats: "QR_CODE,DATA_MATRIX,EAN_8,EAN_13,CODE_39,CODE_93,CODE_128,UPC_A,UPC_E,ITF,CODABAR,PDF_417,AZTEC",
        orientation: "portrait",
      });

      if (result?.cancelled) return;

      const text = (result?.text || "").trim();

      if (!text) {
        await this.common.showAlertMessage("Kein Code erkannt.", "iMisa");
        return;
      }

      // Normalizar: probar numérico (Code) o alfanumérico (SearchCode)
      const asNumber = Number(text);
      let foundIndexGlobal = -1;

      if (!isNaN(asNumber)) {
        // Buscar por Code exacto
        foundIndexGlobal = this.allItems.findIndex(
          (x) => Number(x.Code) === asNumber
        );
      }

      if (foundIndexGlobal === -1) {
        // Buscar por SearchCode (case-insensitive, recorta espacios)
        const norm = text.toUpperCase();
        foundIndexGlobal = this.allItems.findIndex(
          (x) => (x.SearchCode || "").toUpperCase().trim() === norm
        );
      }

      if (foundIndexGlobal === -1) {
        await this.common.showAlertMessage(
          `Artikel: ${text}\n\nFormato: ${result?.format || 'desconocido'}\n\nnicht gefunden.`,
          "iMisa"
        );
        return;
      }

      // Asegurar que el artículo esté visible según filtro y seleccionarlo
      this.applyFilter();
      let idxVisible = this.items.indexOf(this.allItems[foundIndexGlobal]);

      if (idxVisible === -1) {
        // Está filtrado; muestra todos o solo no confirmados según corresponda
        // Si el item está confirmado y tenemos filtro de "solo no confirmados", desactívalo para poder verlo
        this.showOnlyUnconfirmed = false;
        this.applyFilter();
        idxVisible = this.items.indexOf(this.allItems[foundIndexGlobal]);
      }

      if (idxVisible !== -1) {
        this.selectItem(idxVisible);
      } else {
        await this.common.showAlertMessage("Artikel nicht sichtbar.", "iMisa");
      }
    } catch (err) {
      await this.common.showErrorMessage("Scan fehlgeschlagen.");
    }
  }
}
