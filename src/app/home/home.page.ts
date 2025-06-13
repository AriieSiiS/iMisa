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
    this._uniqueDeviceId = await this.commonService.getDeviceId();
    this.commonService.uniqueDeviceId = this._uniqueDeviceId;
  }

  async setDeviceId() {
    this._uniqueDeviceId = await this.commonService.getDeviceId();
    this.commonService.uniqueDeviceId = this._uniqueDeviceId;
  }

  async ShowOrders() {
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
    const hasData = await this.nativeStorageService.hasAllDataSaved();

    if (!hasData) {
      const dataOk = await this.fileUpdatesService.fetchAndSaveAllFiles(true);

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
    } catch (error) {
      userName = "";
    }

    if (!userName || userName.length <= 0) {
      await this.commonService.showAlertMessage(
        "Bitte geben Sie die Initialen des Benutzers in den App-Einstellungen ein.",
        "iMisa"
      );
      return;
    }

    const orders: Order[] = await this.orderService.getOrder();

    if (orders.length > 0) {
      const boundPcatCode = orders[0]?.boundPCatCode?.toString() ?? "0";
      const accountNumber = orders[0]?.accountno?.toString() ?? "0";
      const orderLines = this.mapOrdersToApiLines(orders);

      try {
        await this.dataAccessServiceService.postOrderToApi(
          boundPcatCode,
          accountNumber,
          userName,
          orderLines
        );

        await this.orderService.saveOrderToHistory(orders, userName);
        await this.orderService.clearAll();

        await this.fileUpdatesService.fetchAndSaveAllFiles();

        await this.commonService.showAlertMessage(
          "Der Auftrag wurde erfolgreich übermittelt, im Verlauf gespeichert und die Daten wurden aktualisiert.",
          "iMisa"
        );
      } catch (error) {
        await this.commonService.showAlertMessage(
          "Fehler beim Senden des Auftrags: " + (error?.message || error),
          "iMisa"
        );
      }
    } else {
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
