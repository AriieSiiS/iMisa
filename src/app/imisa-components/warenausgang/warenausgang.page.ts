import { Component } from "@angular/core";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";
import { CommonService } from "../../imisa-services/common.service";
import { NativestorageService } from "../../imisa-services/nativestorage.service";
import { WarenausgangLine } from "../../models/warenausgang";

@Component({
  selector: "app-warenausgang",
  templateUrl: "./warenausgang.page.html",
  styleUrls: ["./warenausgang.page.scss"],
  standalone: false,
})
export class WarenausgangPage {
  private readonly WA_LINES_KEY = "wa_lines";
  private readonly WAREHOUSE_LOCATION_KEY = "warehouse_location"; // Lagerort por dispositivo

  // Lagerort por defecto leído de Settings
  defaultWarehouse: number | null = null;

  // Scan / entrada
  lastRaw: string = "";
  lastParsed: { storagePlaceId: number; procCatCode: number } | null = null;
  manualCode: string = "";

  // Estado de carrito
  lines: WarenausgangLine[] = [];
  selectedIndex: number | null = null;

  // Edición actual
  editQty: number | null = null;
  editLeistungsdatum: string | null = null; // yyyy-MM-dd
  editMedIndiziert: boolean = false;

  // --- NUEVO: Split parcial
  splitQty: number | null = null;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private common: CommonService,
    private native: NativestorageService
  ) {}

  async ionViewWillEnter() {
    await this.loadDefaultWarehouse();
    await this.loadLines();
  }

  private async loadDefaultWarehouse() {
    try {
      const v = await this.native.getNativeValue(this.WAREHOUSE_LOCATION_KEY);
      this.defaultWarehouse =
        v !== null && v !== undefined && v !== "" ? Number(v) : null;
    } catch {
      this.defaultWarehouse = null;
    }
  }

  private async loadLines() {
    try {
      const arr = (await this.native.getNativeValue(this.WA_LINES_KEY)) || [];
      this.lines = Array.isArray(arr) ? arr : [];
      if (this.lines.length === 0) {
        this.selectedIndex = null;
      } else if (this.selectedIndex === null) {
        this.selectLine(0);
      } else if (!this.lines[this.selectedIndex]) {
        this.selectLine(0);
      }
    } catch {
      await this.common.showErrorMessage(
        "Fehler beim Lesen der Warenausgangsdaten."
      );
    }
  }

  private async persistLines() {
    try {
      await this.native.setNativeValue(this.WA_LINES_KEY, this.lines);
    } catch {
      await this.common.showErrorMessage("Fehler beim Speichern.");
    }
  }

  // ---------- Scan / parse ----------
  private async parseCode(rawIn: string) {
    const raw = (rawIn ?? "").replace(/\s+/g, "").trim();
    this.lastRaw = raw;
    this.lastParsed = null;

    if (!raw) {
      await this.common.showAlertMessage("Kein Code erkannt.", "iMisa");
      return;
    }

    const parts = raw.split("#");
    if (parts.length !== 2) {
      await this.common.showAlertMessage(
        "Ungültiges Format (erwartet: Lagerort#ProcCatCode).",
        "iMisa"
      );
      return;
    }

    const storagePlaceId = Number(parts[0]);
    const procCatCode = Number(parts[1]);

    if (isNaN(storagePlaceId) || isNaN(procCatCode)) {
      await this.common.showAlertMessage("Ungültige Nummern im Code.", "iMisa");
      return;
    }

    this.lastParsed = { storagePlaceId, procCatCode };
    await this.common.showMessage("Code erkannt.");
  }

  async scanAndParse() {
    try {
      const result = await this.barcodeScanner.scan({
        showFlipCameraButton: true,
        showTorchButton: true,
        prompt: "QR/Code für Warenausgang scannen",
        resultDisplayDuration: 0,
        formats: "QR_CODE,DATA_MATRIX,PDF_417,AZTEC,CODE_128,EAN_13",
        orientation: "portrait",
      });
      if (result?.cancelled) return;
      await this.parseCode(result?.text || "");
    } catch (err) {
      await this.common.showErrorMessage(
        "Scan fehlgeschlagen: " + (err?.message || err)
      );
    }
  }

  async parseManual() {
    await this.parseCode(this.manualCode);
  }

  // ---------- Líneas ----------
  async addFromParsed(defaultQty: number = 1) {
    if (!this.lastParsed) {
      await this.common.showAlertMessage(
        "Kein gültiger Code vorhanden.",
        "iMisa"
      );
      return;
    }

    // Fallback opcional: si el QR no trajera Lagerort y hay default => úsalo
    const storagePlaceId =
      this.lastParsed.storagePlaceId && this.lastParsed.storagePlaceId > 0
        ? this.lastParsed.storagePlaceId
        : this.defaultWarehouse ?? this.lastParsed.storagePlaceId;

    const line: WarenausgangLine = {
      storagePlaceId,
      procCatCode: this.lastParsed.procCatCode,
      qty: defaultQty > 0 ? defaultQty : 1,
      leistungsdatum: null,
      medizinischIndiziert: false,
    };
    this.lines.unshift(line);
    await this.persistLines();
    this.selectLine(0);
    await this.common.showMessage("Position hinzugefügt.");
  }

  selectLine(index: number) {
    this.selectedIndex = index;
    const ln = this.lines[index];
    if (ln) {
      this.editQty = ln.qty ?? 1;
      this.editLeistungsdatum = ln.leistungsdatum ?? null;
      this.editMedIndiziert = !!ln.medizinischIndiziert;
      this.splitQty = null; // reset campo de split
    } else {
      this.editQty = null;
      this.editLeistungsdatum = null;
      this.editMedIndiziert = false;
      this.splitQty = null;
    }
  }

  async saveSelected() {
    if (this.selectedIndex === null) return;
    const ln = this.lines[this.selectedIndex];
    if (!ln) return;

    const q = Number(this.editQty);
    if (isNaN(q) || q <= 0) {
      await this.common.showAlertMessage(
        "Ungültige Menge (muss > 0 sein).",
        "iMisa"
      );
      return;
    }

    ln.qty = q;
    ln.leistungsdatum = this.editLeistungsdatum || null;
    ln.medizinischIndiziert = !!this.editMedIndiziert;

    await this.persistLines();
    await this.common.showMessage("Position gespeichert.");
  }

  async deleteSelected() {
    if (this.selectedIndex === null) return;
    const idx = this.selectedIndex;
    if (idx < 0 || idx >= this.lines.length) return;
    this.lines.splice(idx, 1);
    this.selectedIndex = null;
    await this.persistLines();
    if (this.lines.length > 0) this.selectLine(0);
  }

  async duplicateSelected() {
    if (this.selectedIndex === null) return;
    const ln = this.lines[this.selectedIndex];
    if (!ln) return;
    const copy: WarenausgangLine = { ...ln };
    this.lines.splice(this.selectedIndex + 1, 0, copy);
    await this.persistLines();
    this.selectLine(this.selectedIndex + 1);
    await this.common.showMessage("Position dupliziert.");
  }

  // --- NUEVO: dividir cantidad en una segunda línea (parcial)
  async splitSelected() {
    if (this.selectedIndex === null) return;
    const ln = this.lines[this.selectedIndex];
    if (!ln) return;

    const part = Number(this.splitQty);
    const current = Number(ln.qty);

    if (isNaN(part) || part <= 0) {
      await this.common.showAlertMessage("Teilmenge muss > 0 sein.", "iMisa");
      return;
    }
    if (isNaN(current) || current <= 0) {
      await this.common.showAlertMessage("Ungültige Ausgangsmenge.", "iMisa");
      return;
    }
    if (part >= current) {
      await this.common.showAlertMessage(
        "Teilmenge muss kleiner als die aktuelle Menge sein.",
        "iMisa"
      );
      return;
    }

    // Nueva línea con 'part'; la original queda con (current - part)
    ln.qty = current - part;
    const copy: WarenausgangLine = {
      ...ln,
      qty: part,
    };
    this.lines.splice(this.selectedIndex + 1, 0, copy);

    await this.persistLines();
    this.selectLine(this.selectedIndex + 1);
    await this.common.showMessage("Position geteilt.");
  }

  // ---------- Payload y envío (mock) ----------

  /**
   * Prepara el payload para el POST real (sin endpoint aún).
   * Ajusta nombres de campos aquí cuando tengamos contrato definitivo del backend.
   */
  private mapToOutgoingPayload(lines: WarenausgangLine[]) {
    return {
      // TODO: añadir cabecera si el backend lo requiere (usuario, deviceId, etc.)
      Lines: lines.map((ln) => ({
        StoragePlaceID: ln.storagePlaceId,
        ProcCatCode: ln.procCatCode,
        Quantity: ln.qty,
        Leistungsdatum: ln.leistungsdatum || null,
        MedizinischIndiziert: !!ln.medizinischIndiziert,
      })),
    };
  }

  async sendMock() {
    if (!this.lines || this.lines.length === 0) {
      await this.common.showAlertMessage(
        "Keine Positionen vorhanden.",
        "iMisa"
      );
      return;
    }

    // Preparar payload (para inspección/log si quieres)
    const payload = this.mapToOutgoingPayload(this.lines);
    // console.log('Outgoing payload (mock):', payload);

    await this.common.showLoader("Warenausgang wird gesendet...");

    // FUTURO (real):
    // try {
    //   await this.dataAccessService.postOutgoingOrder(payload);
    // } catch (err) {
    //   await this.common.hideLoader();
    //   await this.common.showErrorMessage("Senden fehlgeschlagen: " + (err?.message || err));
    //   return;
    // }

    // Mock OK → limpiar
    this.lines = [];
    this.selectedIndex = null;
    await this.persistLines();
    await this.common.hideLoader();
    await this.common.showMessage("Warenausgang (Mock) gesendet und geleert.");
  }
}
