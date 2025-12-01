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
  private isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private fileUpdatesService: FileUpdatesService,
    private commonService: CommonService,
    private dataAccessServiceService: DataAccessServiceService,
    private nativeStorageService: NativestorageService,
    private orderService: OrderService
  ) {}

  async ngOnInit(): Promise<void> {
    this._uniqueDeviceId = await this.commonService.getDeviceId();
    this.commonService.uniqueDeviceId = this._uniqueDeviceId;
  }

  async setDeviceId() {
    this._uniqueDeviceId = await this.commonService.getDeviceId();
    this.commonService.uniqueDeviceId = this._uniqueDeviceId;
  }

  async ShowOrders() {
    const baseUrl = await this.commonService.getServerUrl();

    if (!baseUrl) {
      await this.commonService.showAlertMessage(
        "Server-URL fehlt. Bitte geben Sie die Server-URL in den App-Einstellungen ein.",
        "iMisa"
      );
      return false;
    }

    const hasData = await this.nativeStorageService.hasAllDataSaved();

    if (!hasData) {
      await this.commonService.showAlertMessage(
        "Keine lokalen Daten gefunden. Bitte zuerst einen Auftrag absenden, um die Daten zu laden.",
        "iMisa"
      );
      return false;
    }
    this.router.navigateByUrl("tabs");
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
    // Prevenir múltiples envíos simultáneos
    if (this.isSubmitting) {
      console.log("[Home] submitOrder ya está en ejecución, ignorando click duplicado");
      return;
    }

    this.isSubmitting = true;

    try {
      const hasData = await this.nativeStorageService.hasAllDataSaved();

      if (!hasData) {
        console.log("[Home] No hay datos locales, intentando descargar...");
        const dataOk = await this.fileUpdatesService.fetchAndSaveAllFiles(true);

        if (dataOk) {
          // Verificar que los datos realmente se guardaron
          const dataVerified = await this.nativeStorageService.hasAllDataSaved();

          if (dataVerified) {
            console.log("[Home] Datos descargados y verificados correctamente");
            await this.commonService.showAlertMessage(
              "Initialdaten wurden heruntergeladen. Die App kann jetzt offline verwendet werden.",
              "iMisa"
            );
          } else {
            console.error("[Home] Descarga reportó éxito pero los datos no están disponibles");
            await this.commonService.showAlertMessage(
              "Fehler beim Speichern der Initialdaten. Bitte erneut versuchen.",
              "iMisa"
            );
          }
        } else {
          console.error("[Home] Fehler beim Herunterladen der Initialdaten");
          await this.commonService.showAlertMessage(
            "Fehler beim Herunterladen der Initialdaten (products oder boundpcatcode). Bitte Internetverbindung und Server prüfen.",
            "iMisa"
          );
        }
        this.isSubmitting = false;
        return;
      }

      let userName: any;
      try {
        userName = await this.nativeStorageService.getNativeValue(
          this.commonService.USER_INITIAL
        );
      } catch (error) {
        userName = "";
      }

      if (!userName || userName.length <= 0) {
        await this.commonService.showAlertMessage(
          "Bitte geben Sie die Initialen des Benutzers in den App-Einstellungen ein.",
          "iMisa"
        );
        this.isSubmitting = false;
        return;
      }

      const orders: Order[] = await this.orderService.getOrder();

      if (orders.length > 0) {
        // Validar conexión con el servidor ANTES de intentar enviar
        await this.commonService.showLoader("Prüfe Serververbindung...");
        const serverReachable = await this.dataAccessServiceService.testServerConnection();
        await this.commonService.hideLoader();

        if (!serverReachable) {
          await this.commonService.showAlertMessage(
            "Keine Verbindung zum Server möglich. Bitte überprüfen Sie:\n\n" +
            "1. Server-URL in den Einstellungen\n" +
            "2. Internetverbindung\n" +
            "3. Server ist erreichbar\n\n" +
            "Der Auftrag wurde NICHT gesendet.",
            "Verbindungsfehler"
          );
          this.isSubmitting = false;
          return;
        }

        const boundPcatCode = orders[0]?.boundPCatCode?.toString() ?? "0";
        const accountNumber = orders[0]?.accountno?.toString() ?? "0";
        const orderLines = this.mapOrdersToApiLines(orders);

        try {
          console.log("[Home] Enviando pedido al servidor...");
          await this.commonService.showLoader("Sende Auftrag...");

          await this.dataAccessServiceService.postOrderToApi(
            boundPcatCode,
            accountNumber,
            userName,
            orderLines
          );

          console.log("[Home] Pedido enviado exitosamente, guardando en historial...");
          await this.orderService.saveOrderToHistory(orders, userName);
          await this.orderService.clearAll();

          await this.commonService.hideLoader();
          console.log("[Home] Mostrando mensaje de confirmación...");

          // IMPORTANTE: NO hacer auto-sync aquí para evitar borrar datos
          // El auto-sync se puede hacer manualmente desde Settings si es necesario
          await this.commonService.showAlertMessage(
            "Der Auftrag wurde erfolgreich übermittelt und im Verlauf gespeichert.",
            "iMisa"
          );

          console.log("[Home] Mensaje de confirmación mostrado");
        } catch (error) {
          await this.commonService.hideLoader();
          console.error("[Home] Error al enviar pedido:", error);
          await this.commonService.showAlertMessage(
            "Fehler beim Senden des Auftrags: " + (error?.message || error),
            "iMisa"
          );
        }
      } else {
        console.log("[Home] No hay pedidos para enviar");
        await this.commonService.showAlertMessage(
          "Kein Auftrag zum Übermitteln.",
          "iMisa"
        );
      }
    } finally {
      // SIEMPRE liberar el flag, incluso si hay error
      this.isSubmitting = false;
      console.log("[Home] submitOrder finalizado, flag liberado");
    }
  }

  openSettings() {
    this.router.navigateByUrl("app-settings");
  }

  openInventory() {
    this.router.navigateByUrl("inventory");
  }

  goToWarenausgangTabs() {
    this.router.navigateByUrl("/wa-tabs");
  }
}
