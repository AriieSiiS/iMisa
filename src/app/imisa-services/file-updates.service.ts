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

  async PostOrerToServer(): Promise<boolean> {
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
        ),
      this.dataAccessServiceService
        .getBoundPcatCodeRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("boundpcatcode", data)
        ),
      this.dataAccessServiceService
        .getAccountsRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("accounts", data)
        ),
      this.dataAccessServiceService
        .getRightsRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("rights", data)
        ),
      this.dataAccessServiceService
        .getMawiMatGroupRest()
        .then((data) =>
          this.nativeStorageService.setNativeValue("mawimatgroup", data)
        ),
    ];

    try {
      await Promise.all(dataFetchPromises);
      if (showLoader) await this.commonService.hideLoader();
      return true;
    } catch (error) {
      if (showLoader) await this.commonService.hideLoader();
      return false;
    }
  }
}
