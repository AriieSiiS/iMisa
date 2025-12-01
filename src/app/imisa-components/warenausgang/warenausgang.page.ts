import { Component } from "@angular/core";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";
import { CommonService } from "../../imisa-services/common.service";
import { NativestorageService } from "../../imisa-services/nativestorage.service";
import { WarenausgangLine } from "../../models/warenausgang";
import { ProductService } from "../../imisa-services/product.service";
import { Product } from "../../models/product";
import { WaHistoryService } from "../../imisa-services/wa-history.service";
import { WarenausgangHistoryEntry } from "../../models/wa-history";
import { ActivatedRoute } from "@angular/router";

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
  // Lagerort editable por el usuario
  editableLagerort: number | null = null;

  // Scan / entrada
  lastRaw: string = "";
  lastParsed: { storagePlaceId: number; procCatCode: number } | null = null;
  manualCode: string = "";

  // Estado de carrito
  lines: WarenausgangLine[] = [];
  selectedIndex: number | null = null;

  // Edición actual (carrito)
  editQty: number | null = null;
  editLeistungsdatum: string | null = null; // yyyy-MM-dd
  editMedIndiziert: boolean = false;

  // Split parcial
  splitQty: number | null = null;

  // Detalle tipo "compra"
  detailProduct: Product | null = null;
  waQty: number | null = null;
  waDate: string | null = null;
  waMedInd: boolean = false;
  detailError: string = "";

  // Group Entry
  groupActive: boolean = false;
  groupProducts: Product[] = [];
  groupIndex: number = 0;
  groupStoragePlaceId: number = 0;
  groupCurrent: Product | null = null;
  groupQty: number | null = null;
  groupError: string = "";
  groupConfirmed: WarenausgangLine[] = [];
  groupRemainderPending: { product: Product; qty: number } | null = null;
  groupManualConfirmCode: string = "";

  // === NUEVO: caché de productos para mostrar descripción en carrito ===
  productDescMap: { [code: number]: string } = {};

  constructor(
    private barcodeScanner: BarcodeScanner,
    private common: CommonService,
    private native: NativestorageService,
    private productService: ProductService,
    private history: WaHistoryService,
    private route: ActivatedRoute
  ) {}

  async ionViewWillEnter() {
    await this.loadDefaultWarehouse();
    // Inicializar lagerort editable con el valor por defecto
    this.editableLagerort = this.defaultWarehouse;
    await this.loadLines();
    await this.hydrateDescriptionsFromLines();

    const codeParam = this.route.snapshot.queryParamMap.get("code");
    if (codeParam) {
      const c = Number(codeParam);
      if (!isNaN(c) && c > 0) {
        this.lastParsed = {
          storagePlaceId: this.defaultWarehouse ?? 0,
          procCatCode: c,
        };
        await this.openDetailForProcCat(c);
      }
    }
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

  // ---------- helpers ----------
  private isAllDigits(s: string): boolean {
    return /^[0-9]+$/.test(s);
  }

  private async getProductsByBound(boundCode: number): Promise<Product[]> {
    try {
      const anySvc: any = this.productService as any;
      if (typeof anySvc.getProducts === "function") {
        const list = await anySvc.getProducts(boundCode);
        if (Array.isArray(list)) return list as Product[];
      }
    } catch {}
    const all = await this.productService.getAllProducts();
    return all.filter((p) => Number(p.boundPCatCode) === Number(boundCode));
  }

  private initQtyFromProduct(p: Product): number {
    const std = Number((p as any)?.OrdStdQty);
    if (!Number.isNaN(std) && std > 0) return std;

    if (Number((p as any)?.minqty) > 0) return Number((p as any).minqty);
    if (Number((p as any)?.defaultqty) > 0)
      return Number((p as any).defaultqty);
    return 1;
  }

  private applyQtyRules(
    p: Product,
    qtyIn: number
  ): { qty: number; msg: string } {
    let msg = "";
    let qty = Number(qtyIn);

    const min =
      Number((p as any)?.OrdQtyMin) || Number((p as any)?.minqty) || 0;

    const max =
      Number((p as any)?.OrdQtyMax) ||
      Number((p as any)?.maxqty) ||
      Number.MAX_SAFE_INTEGER;

    const factor =
      Number((p as any)?.OrdQtyFactor) || Number((p as any)?.factorqty) || 1;

    if (qty < min) qty = min;
    if (qty > max) qty = max;

    if (factor > 1) {
      const base = min || 0;
      const delta = qty - base;
      const remainder = delta % factor;
      if (remainder !== 0) {
        qty = base + Math.ceil(delta / factor) * factor;
        if (qty > max) qty = max;
        msg = `Die Menge muss ein Vielfaches des Faktors (${factor}) sein. Angepasst auf ${qty}.`;
      }
    }
    return { qty, msg };
  }

  // === NUEVO: hidratar descripciones para los códigos presentes en lines ===
  private async hydrateDescriptionsFromLines() {
    const unique = Array.from(
      new Set(this.lines.map((l) => Number(l.procCatCode)))
    );
    const toFetch = unique.filter((c) => this.productDescMap[c] === undefined);
    if (toFetch.length === 0) return;

    for (const code of toFetch) {
      try {
        const prod = await this.productService.getProductByCodeGlobal(code);
        this.productDescMap[code] = prod?.descinternal || `#${code}`;
      } catch {
        this.productDescMap[code] = `#${code}`;
      }
    }
  }

  // ---------- Scan / parse ----------
  private async parseCode(rawIn: string) {
    const raw = (rawIn ?? "").trim();
    this.lastRaw = raw;
    this.lastParsed = null;
    this.detailProduct = null;
    this.groupActive = false;

    if (!raw) {
      await this.common.showAlertMessage("Kein Code erkannt.", "iMisa");
      return;
    }

    if (raw.indexOf("#") === -1) {
      if (!this.isAllDigits(raw)) {
        await this.common.showAlertMessage(
          "Ungültiges Format. Erwartet: Zahl (Group) oder Lagerort#Code.",
          "iMisa"
        );
        return;
      }
      const boundCode = Number(raw);
      const storagePlaceId = this.editableLagerort ?? this.defaultWarehouse ?? 0;
      await this.startGroupWizard(boundCode, storagePlaceId);
      return;
    }

    const cleaned = raw.replace(/\s+/g, "");
    const parts = cleaned.split("#");
    if (
      parts.length !== 2 ||
      !this.isAllDigits(parts[0]) ||
      !this.isAllDigits(parts[1])
    ) {
      await this.common.showAlertMessage(
        "Ungültiges Format (erwartet: Lagerort#Code).",
        "iMisa"
      );
      return;
    }

    const storagePlaceId = Number(parts[0]);
    const code = Number(parts[1]);

    const children = await this.getProductsByBound(code);
    if (children.length > 0) {
      await this.startGroupWizard(code, storagePlaceId);
      return;
    }

    this.lastParsed = { storagePlaceId, procCatCode: code };
    await this.openDetailForProcCat(code);
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

  // ---------- Detalle tipo compra (ProcCatCode) ----------
  private async openDetailForProcCat(procCatCode: number) {
    const prod = await this.productService.getProductByCodeGlobal(procCatCode);
    if (!prod) {
      await this.common.showAlertMessage(
        "Ungültiger Code (nicht im Katalog).",
        "iMisa"
      );
      this.detailProduct = null;
      return;
    }
    this.detailProduct = prod;
    this.waQty = this.initQtyFromProduct(prod);
    this.waDate = null;
    this.waMedInd = false;
    this.detailError = "";
  }

  validateWaQty(newVal: any) {
    if (!this.detailProduct) return;
    const r = this.applyQtyRules(this.detailProduct, Number(newVal));
    this.waQty = r.qty;
    this.detailError = r.msg;
  }

  async confirmDetailToCart() {
    if (!this.detailProduct || !this.lastParsed) return;

    const q = Number(this.waQty);
    if (isNaN(q) || q <= 0) {
      await this.common.showAlertMessage("Ungültige Menge.", "iMisa");
      return;
    }

    const storagePlaceId =
      this.lastParsed.storagePlaceId && this.lastParsed.storagePlaceId > 0
        ? this.lastParsed.storagePlaceId
        : this.editableLagerort ?? this.defaultWarehouse ?? 0;

    const line: WarenausgangLine = {
      storagePlaceId,
      procCatCode: this.detailProduct.code,
      qty: q,
      leistungsdatum: this.waDate || null,
      medizinischIndiziert: !!this.waMedInd,
    };

    this.lines.unshift(line);
    await this.persistLines();
    await this.hydrateDescriptionsFromLines();

    // limpiar detalle
    this.detailProduct = null;
    this.waQty = null;
    this.waDate = null;
    this.waMedInd = false;
    this.detailError = "";

    this.selectLine(0);
    await this.common.showMessage("Position hinzugefügt.");
  }

  // ---------- Group entry wizard ----------
  private async startGroupWizard(boundCode: number, storagePlaceId: number) {
    const children = await this.getProductsByBound(boundCode);
    if (!children || children.length === 0) {
      await this.common.showAlertMessage(
        "Keine Gruppenartikel gefunden.",
        "iMisa"
      );
      return;
    }

    this.groupActive = true;
    this.groupProducts = children;
    this.groupStoragePlaceId =
      storagePlaceId && storagePlaceId > 0
        ? storagePlaceId
        : this.editableLagerort ?? this.defaultWarehouse ?? 0;
    this.groupConfirmed = [];
    this.groupIndex = 0;
    this.groupRemainderPending = null;
    this.groupManualConfirmCode = "";

    await this.loadGroupCurrent();
  }

  private async loadGroupCurrent() {
    this.groupError = "";
    this.groupRemainderPending = null;
    this.groupManualConfirmCode = "";

    this.groupCurrent = this.groupProducts[this.groupIndex] || null;
    if (!this.groupCurrent) {
      if (this.groupConfirmed.length > 0) {
        this.lines = [...this.groupConfirmed, ...this.lines];
        await this.persistLines();
        await this.hydrateDescriptionsFromLines();
        await this.common.showMessage("Gruppenpositionen hinzugefügt.");
      }
      this.groupActive = false;
      this.groupProducts = [];
      this.groupIndex = 0;
      this.groupConfirmed = [];
      this.groupCurrent = null;
      this.groupQty = null;
      return;
    }

    this.groupQty = this.initQtyFromProduct(this.groupCurrent);
  }

  validateGroupQty(newVal: any) {
    if (!this.groupCurrent) return;
    const r = this.applyQtyRules(this.groupCurrent, Number(newVal));
    this.groupQty = r.qty;
    this.groupError = r.msg;
  }

  async groupSkip() {
    this.groupIndex++;
    await this.loadGroupCurrent();
  }

  async groupConfirm() {
    if (!this.groupCurrent) return;
    const prod = this.groupCurrent;
    const defaultQty = this.initQtyFromProduct(prod);
    const chosen = Number(this.groupQty);

    if (isNaN(chosen) || chosen <= 0) {
      await this.common.showAlertMessage("Ungültige Menge.", "iMisa");
      return;
    }

    if (chosen >= defaultQty) {
      this.groupConfirmed.push({
        storagePlaceId: this.groupStoragePlaceId,
        procCatCode: prod.code,
        qty: chosen,
        leistungsdatum: null,
        medizinischIndiziert: false,
      });
      this.groupIndex++;
      await this.loadGroupCurrent();
      return;
    }

    const remainder = defaultQty - chosen;

    this.groupConfirmed.push({
      storagePlaceId: this.groupStoragePlaceId,
      procCatCode: prod.code,
      qty: chosen,
      leistungsdatum: null,
      medizinischIndiziert: false,
    });

    this.groupRemainderPending = { product: prod, qty: remainder };
    await this.common.showMessage(
      `Restmenge ${remainder} bestätigen (Scan oder manuell).`
    );
  }

  async groupConfirmRemainderByScan() {
    if (!this.groupRemainderPending) return;
    try {
      const result = await this.barcodeScanner.scan({
        showFlipCameraButton: true,
        showTorchButton: true,
        prompt: "Restmenge bestätigen – Artikel scannen",
        resultDisplayDuration: 0,
        formats: "QR_CODE,DATA_MATRIX,CODE_128,EAN_13",
        orientation: "portrait",
      });
      if (result?.cancelled) return;
      const text = (result?.text ?? "").trim();
      const code = Number(text.replace(/\s+/g, ""));
      await this.handleRemainderConfirmation(code);
    } catch (err) {
      await this.common.showErrorMessage(
        "Scan fehlgeschlagen: " + (err?.message || err)
      );
    }
  }

  async groupConfirmRemainderByManual() {
    if (!this.groupRemainderPending) return;
    const code = Number((this.groupManualConfirmCode ?? "").trim());
    await this.handleRemainderConfirmation(code);
  }

  private async handleRemainderConfirmation(enteredCode: number) {
    const pending = this.groupRemainderPending!;
    if (isNaN(enteredCode) || enteredCode <= 0) {
      await this.common.showAlertMessage(
        "Ungültiger Code zur Bestätigung.",
        "iMisa"
      );
      return;
    }
    if (Number(pending.product.code) !== Number(enteredCode)) {
      await this.common.showAlertMessage("Code stimmt nicht überein.", "iMisa");
      return;
    }

    this.groupConfirmed.push({
      storagePlaceId: this.groupStoragePlaceId,
      procCatCode: pending.product.code,
      qty: pending.qty,
      leistungsdatum: null,
      medizinischIndiziert: false,
    });

    this.groupRemainderPending = null;
    this.groupManualConfirmCode = "";
    this.groupIndex++;
    await this.loadGroupCurrent();
  }

  // ---------- Líneas (carrito) ----------
  async addFromParsed() {
    if (!this.lastParsed) {
      await this.common.showAlertMessage(
        "Kein gültiger Code vorhanden.",
        "iMisa"
      );
      return;
    }

    // Buscar el producto en el catálogo para obtener OrdStdQty
    const product = await this.productService.getProductByCodeGlobal(
      this.lastParsed.procCatCode
    );

    // Usar initQtyFromProduct para obtener la cantidad correcta (OrdStdQty, minqty, defaultqty, o 1)
    const qty = product ? this.initQtyFromProduct(product) : 1;

    // Usar editableLagerort en lugar de defaultWarehouse
    const storagePlaceId =
      this.lastParsed.storagePlaceId && this.lastParsed.storagePlaceId > 0
        ? this.lastParsed.storagePlaceId
        : this.editableLagerort ?? this.defaultWarehouse ?? 0;

    const line: WarenausgangLine = {
      storagePlaceId,
      procCatCode: this.lastParsed.procCatCode,
      qty,
      leistungsdatum: null,
      medizinischIndiziert: false,
    };
    this.lines.unshift(line);
    await this.persistLines();
    await this.hydrateDescriptionsFromLines();
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
      this.splitQty = null;
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
    await this.hydrateDescriptionsFromLines();
    if (this.lines.length > 0) this.selectLine(0);
  }

  async duplicateSelected() {
    if (this.selectedIndex === null) return;
    const ln = this.lines[this.selectedIndex];
    if (!ln) return;
    const copy: WarenausgangLine = { ...ln };
    this.lines.splice(this.selectedIndex + 1, 0, copy);
    await this.persistLines();
    await this.hydrateDescriptionsFromLines();
    this.selectLine(this.selectedIndex + 1);
    await this.common.showMessage("Position dupliziert.");
  }

  // Split parcial (Teilen): mueve una parte a una nueva línea
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
    const copy: WarenausgangLine = { ...ln, qty: part };
    this.lines.splice(this.selectedIndex + 1, 0, copy);

    await this.persistLines();
    await this.hydrateDescriptionsFromLines();
    this.selectLine(this.selectedIndex + 1);
    await this.common.showMessage("Position geteilt.");
  }

  async deleteLine(index: number) {
    if (index < 0 || index >= this.lines.length) return;
    this.lines.splice(index, 1);
    if (this.selectedIndex === index) this.selectedIndex = null;
    await this.persistLines();
    await this.hydrateDescriptionsFromLines();
  }

  // ---------- Payload y envío (mock) ----------
  private mapToOutgoingPayload(lines: WarenausgangLine[]) {
    return {
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

    const payload = this.mapToOutgoingPayload(this.lines);

    await this.common.showLoader("Warenausgang wird gesendet...");

    // Crear entrada de historial
    const totalLines = this.lines.length;
    const totalQty = this.lines.reduce((s, x) => s + Number(x.qty || 0), 0);
    const homogLager = this.lines.every(
      (x) => x.storagePlaceId === this.lines[0].storagePlaceId
    )
      ? this.lines[0].storagePlaceId
      : null;

    const entry: WarenausgangHistoryEntry = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAtIso: new Date().toISOString(),
      storagePlaceId: homogLager,
      totalLines,
      totalQty,
      payload,
      lines: this.lines.map((ln) => ({
        storagePlaceId: ln.storagePlaceId,
        procCatCode: ln.procCatCode,
        qty: ln.qty,
        leistungsdatum: ln.leistungsdatum || null,
        medizinischIndiziert: !!ln.medizinischIndiziert,
      })),
    };

    await this.history.add(entry);

    this.lines = [];
    this.selectedIndex = null;
    await this.persistLines();
    await this.common.hideLoader();
    await this.common.showMessage("Warenausgang (Mock) gesendet und geleert.");
  }
}
