import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FileUpdatesService } from "../imisa-services/file-updates.service";
import { CommonService } from "../imisa-services/common.service";
import { DataAccessServiceService } from "../data-access/data-access-service.service";
import { Order } from "../models/order";
import { NativestorageService } from "../imisa-services/nativestorage.service";
import { OrderService } from "../imisa-services/order.service";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
  standalone: false,
})
export class HomePage implements OnInit {
  _uniqueDeviceId: string = "";

  constructor(
    private router: Router,
    private fileUpdatesService: FileUpdatesService,
    private commonService: CommonService,
    private dataAccessServiceService: DataAccessServiceService,
    private nativeStorageService: NativestorageService,
    private orderService: OrderService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log("HomePage: ngOnInit iniciado.");
    this._uniqueDeviceId = await this.commonService.getDeviceId();
    this.commonService.uniqueDeviceId = this._uniqueDeviceId;
    console.log(
      "HomePage: DeviceId disponible DESPUÉS de esperar:",
      this._uniqueDeviceId
    );
  }

  async setDeviceId() {
    this._uniqueDeviceId = await this.commonService.getDeviceId();
    this.commonService.uniqueDeviceId = this._uniqueDeviceId;
  }

  async UpdateDefaultNativeSettings() {
    // Esta lógica ya se maneja en la inicialización de CommonService,
    // por lo que este método probablemente ya no sea necesario aquí.
    // Si se mantiene, debería llamar a un método en CommonService.
  }

  async ShowOrders() {
    // El 'res' de PostOrerToServer es un booleano, no está claro qué se quiere hacer aquí.
    // Lo mantengo, pero esta lógica podría necesitar revisión.
    const res = await this.fileUpdatesService.PostOrerToServer("", [], "");
    if (res) {
      this.router.navigateByUrl("tabs");
    }
  }

  private mapOrdersToApiLines(orders: Order[]): any[] {
    return orders.map((o) => ({
      ProductCode: o.code?.toString() ?? "",
      Description: o.productDescription ?? "",
      Quantity: Number(o.amount) ?? 0,
      MatGroup: o.boundPCatCode?.toString() ?? "",
    }));
  }

  async submitOrder() {
    console.log(
      "🔹 [HomePage|submitOrder] -> Iniciando proceso de envío de orden."
    );

    const hasData = await this.nativeStorageService.hasAllDataSaved();
    console.log(
      `🔹 [HomePage|submitOrder] -> ¿Datos locales completos?: ${hasData}`
    );

    if (!hasData) {
      console.log(
        "🔹 [HomePage|submitOrder] -> Faltan datos locales. Iniciando descarga inicial..."
      );
      const dataOk = await this.fileUpdatesService.fetchAndSaveAllFiles(true);
      console.log(
        `🔹 [HomePage|submitOrder] -> ¿Descarga inicial exitosa?: ${dataOk}`
      );

      if (dataOk) {
        await this.commonService.showAlertMessage(
          "Initialdaten wurden heruntergeladen. Die App kann jetzt offline verwendet werden.",
          "iMisa"
        );
      } else {
        await this.commonService.showAlertMessage(
          "Fehler beim Herunterladen der Initialdaten. Bitte Internetverbindung und Server prüfen.",
          "iMisa"
        );
      }
      return;
    }

    let userName: any;
    try {
      userName = await this.nativeStorageService.getNativeValue(
        this.commonService.USER_INITIAL
      );
      console.log(`🔹 [HomePage|submitOrder] -> Usuario obtenido: ${userName}`);
    } catch (error) {
      userName = "";
    }

    if (!userName || userName.length <= 0) {
      console.log(
        "🔹 [HomePage|submitOrder] -> ❌ ERROR: Falta el nombre de usuario."
      );
      await this.commonService.showAlertMessage(
        "Bitte geben Sie die Initialen des Benutzers in den App-Einstellungen ein.",
        "iMisa"
      );
      return;
    }

    const orders: Order[] = await this.orderService.getOrder();
    console.log(
      `🔹 [HomePage|submitOrder] -> Se encontraron ${orders.length} órdenes para enviar.`
    );

    if (orders.length > 0) {
      const boundPcatCode = orders[0]?.boundPCatCode?.toString() ?? "0";
      const accountNumber = orders[0]?.accountno?.toString() ?? "0";
      const orderLines = this.mapOrdersToApiLines(orders);

      console.log(
        `🔹 [HomePage|submitOrder] -> Preparando para llamar a postOrderToApi con:`,
        { boundPcatCode, accountNumber, userName, numLines: orderLines.length }
      );

      try {
        await this.dataAccessServiceService.postOrderToApi(
          boundPcatCode,
          accountNumber,
          userName,
          orderLines
        );
        console.log(
          "🔹 [HomePage|submitOrder] -> ✅ ÉXITO: postOrderToApi completado."
        );

        await this.orderService.saveOrderToHistory(orders, userName);
        await this.orderService.clearAll();

        console.log(
          "🔹 [HomePage|submitOrder] -> Actualizando datos después del envío..."
        );
        await this.fileUpdatesService.fetchAndSaveAllFiles();
        console.log("🔹 [HomePage|submitOrder] -> Datos actualizados.");

        await this.commonService.showAlertMessage(
          "Der Auftrag wurde erfolgreich übermittelt, im Verlauf gespeichert und die Daten wurden aktualisiert.",
          "iMisa"
        );
      } catch (error) {
        console.error(
          "🔹 [HomePage|submitOrder] -> ❌ ERROR al enviar la orden:",
          error
        );
        await this.commonService.showAlertMessage(
          "Fehler beim Senden des Auftrags: " + (error?.message || error),
          "iMisa"
        );
      }
    } else {
      console.log(
        "🔹 [HomePage|submitOrder] -> No hay órdenes para enviar. Solo se actualizarán los datos."
      );
      await this.fileUpdatesService.fetchAndSaveAllFiles();
      await this.commonService.showAlertMessage(
        "Kein Auftrag zum Übermitteln. Die Daten wurden aktualisiert.",
        "iMisa"
      );
    }
  }
  openSettings() {
    this.router.navigateByUrl("app-settings");
  }
}
