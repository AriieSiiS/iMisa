import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { CommonService } from "./common.service";
import { DataAccessServiceService } from "../data-access/data-access-service.service";
import { NativestorageService } from "./nativestorage.service";

@Injectable({
  providedIn: "root",
})
export class FileUpdatesService {
  serId: string = "100";
  version: string = environment.Version;
  appName = environment.AppName;
  userId: number = 1;

  constructor(
    private commonService: CommonService,
    private dataAccessServiceService: DataAccessServiceService,
    private nativeStorageService: NativestorageService
  ) {}

  async prepareFileURL(fileName: string): Promise<string> {
    const baseUrl = await this.commonService.getServerUrl();
    const deviceId = await this.commonService.getDeviceId();
    return `${baseUrl}/Getfiles/${deviceId}_Get${fileName}.axd`;
  }

  async fetchAndSaveAllFiles(showLoader = false): Promise<boolean> {
    if (showLoader) {
      await this.commonService.showLoader("Lade Daten vom Server...");
    }

    const dataFetchPromises = [
      this.dataAccessServiceService
        .getProductsRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("products", data)
        )
        .catch((err) => {
          console.error("[Sync] Error descargando products:", err);
          return null;
        }),
      this.dataAccessServiceService
        .getBoundPcatCodeRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("boundpcatcode", data)
        )
        .catch((err) => {
          console.error("[Sync] Error descargando boundpcatcode:", err);
          return null;
        }),
      this.dataAccessServiceService
        .getAccountsRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("accounts", data)
        )
        .catch((err) => {
          console.error("[Sync] Error descargando accounts:", err);
          return null;
        }),
      this.dataAccessServiceService
        .getRightsRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("rights", data)
        )
        .catch((err) => {
          console.error("[Sync] Error descargando rights:", err);
          return null;
        }),
      this.dataAccessServiceService
        .getMawiMatGroupRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("mawimatgroup", data)
        )
        .catch((err) => {
          console.error("[Sync] Error descargando mawimatgroup:", err);
          return null;
        }),
    ];

    try {
      // Usar Promise.allSettled para que si una falla, las demás continúen
      const results = await Promise.allSettled(dataFetchPromises);

      // Contar cuántas tuvieron éxito
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`[Sync] Resultado: ${successful} exitosas, ${failed} fallidas de ${results.length} total`);

      // Si hubo al menos una descarga exitosa, actualizar timestamp de última sincronización
      if (successful > 0) {
        await this.commonService.setLastSyncDate();
      }

      if (showLoader) await this.commonService.hideLoader();

      // Retornar true si al menos algunas tuvieron éxito
      return successful > 0;
    } catch (error) {
      console.error("[Sync] Error inesperado en fetchAndSaveAllFiles:", error);
      if (showLoader) await this.commonService.hideLoader();
      return false;
    }
  }
}
