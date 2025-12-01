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

    // Tracking de datos esenciales vs opcionales
    let productsSuccess = false;
    let boundPcatSuccess = false;

    try {
      // Descargar products (ESENCIAL)
      try {
        console.log("[Sync] Descargando products...");
        const products = await this.dataAccessServiceService.getProductsRest();
        console.log(`[Sync] Products recibidos: ${Array.isArray(products) ? products.length : 'no array'}`);
        if (products && Array.isArray(products) && products.length > 0) {
          await this.nativeStorageService.setNativeValue("products", products);
          productsSuccess = true;
          console.log("[Sync] Products guardados exitosamente");
        } else {
          console.warn("[Sync] Products está vacío o no es válido");
        }
      } catch (err) {
        console.error("[Sync] Error descargando products:", err);
      }

      // Descargar boundpcatcode (ESENCIAL)
      try {
        console.log("[Sync] Descargando boundpcatcode...");
        const boundPcat = await this.dataAccessServiceService.getBoundPcatCodeRest();
        console.log(`[Sync] BoundPcat recibidos: ${Array.isArray(boundPcat) ? boundPcat.length : 'no array'}`);
        if (boundPcat && Array.isArray(boundPcat) && boundPcat.length > 0) {
          await this.nativeStorageService.setNativeValue("boundpcatcode", boundPcat);
          boundPcatSuccess = true;
          console.log("[Sync] BoundPcat guardados exitosamente");
        } else {
          console.warn("[Sync] BoundPcat está vacío o no es válido");
        }
      } catch (err) {
        console.error("[Sync] Error descargando boundpcatcode:", err);
      }

      // Descargar datos opcionales (NO bloquean el resultado)
      try {
        console.log("[Sync] Descargando accounts...");
        const accounts = await this.dataAccessServiceService.getAccountsRest();
        if (accounts) {
          await this.nativeStorageService.setNativeValue("accounts", accounts);
          console.log("[Sync] Accounts guardados");
        }
      } catch (err) {
        console.error("[Sync] Error descargando accounts:", err);
      }

      try {
        console.log("[Sync] Descargando rights...");
        const rights = await this.dataAccessServiceService.getRightsRest();
        if (rights) {
          await this.nativeStorageService.setNativeValue("rights", rights);
          console.log("[Sync] Rights guardados");
        }
      } catch (err) {
        console.error("[Sync] Error descargando rights:", err);
      }

      try {
        console.log("[Sync] Descargando mawimatgroup...");
        const mawimat = await this.dataAccessServiceService.getMawiMatGroupRest();
        if (mawimat) {
          await this.nativeStorageService.setNativeValue("mawimatgroup", mawimat);
          console.log("[Sync] Mawimatgroup guardados");
        }
      } catch (err) {
        console.error("[Sync] Error descargando mawimatgroup:", err);
      }

      // Verificar si los datos ESENCIALES fueron descargados
      const essentialDataSuccess = productsSuccess && boundPcatSuccess;

      console.log(`[Sync] Resultado final: products=${productsSuccess}, boundpcatcode=${boundPcatSuccess}, esencial=${essentialDataSuccess}`);

      if (essentialDataSuccess) {
        await this.commonService.setLastSyncDate();
      }

      if (showLoader) await this.commonService.hideLoader();

      // Retornar true SOLO si los datos esenciales fueron descargados
      return essentialDataSuccess;
    } catch (error) {
      console.error("[Sync] Error inesperado en fetchAndSaveAllFiles:", error);
      if (showLoader) await this.commonService.hideLoader();
      return false;
    }
  }
}
