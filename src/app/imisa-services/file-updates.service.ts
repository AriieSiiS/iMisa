import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { CommonService } from "./common.service";
import { Papa } from "ngx-papaparse";
import { DataAccessServiceService } from "../data-access/data-access-service.service";
import { Order } from "../models/order";
import { NativestorageService } from "./nativestorage.service";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FileUpdatesService {
  serId: string = "100";
  version: string = environment.Version;
  appName = environment.AppName;
  userId: number = 1;

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService,
    private papa: Papa,
    private dataAccessServiceService: DataAccessServiceService,
    private nativeStorageService: NativestorageService
  ) {}

  async prepareFileURL(fileName: string): Promise<string> {
    const baseUrl = await this.commonService.getServerUrl();
    const deviceId = await this.commonService.getDeviceId();
    return `${baseUrl}/Getfiles/${deviceId}_Get${fileName}.axd`;
  }

  async PostOrerToServer(
    orderData: string,
    arrOrder: Order[],
    initial: string
  ): Promise<boolean> {
    // Sigue siendo una Promise<boolean>
    // 1. MANTENEMOS LAS COSAS BUENAS: Las comprobaciones iniciales
    const baseUrl = await this.commonService.getServerUrl();
    const deviceId = await this.commonService.getDeviceId();

    if (!baseUrl) {
      await this.commonService.showAlertMessage(
        "Server-URL fehlt. Bitte geben Sie die Server-URL in den App-Einstellungen ein.",
        "iMisa"
      );
      return false; // Si no hay URL, sí que fallamos y avisamos.
    }

    const hasData = await this.nativeStorageService.hasAllDataSaved();
    if (!hasData) {
      await this.commonService.showAlertMessage(
        "Keine lokalen Daten gefunden. Bitte zuerst einen Auftrag absenden, um die Daten zu laden.",
        "iMisa"
      );
      return false;
    }

    // 2. HACEMOS LA LLAMADA A LA API "COMO ANTES" (sin bloquear)
    const reqHeader = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    const url = `${baseUrl}/PostOrder/${deviceId}_${this.serId}_${this.version}_${this.appName}_${this.userId}_${initial}`;

    await this.httpClient
      .post(url, orderData, { headers: reqHeader, responseType: "text" })
      .subscribe(async (res) => {
        const jsonObj: any = this.commonService.converXMLtoJson(res);

        if (jsonObj.iMisaUpdates.StatusCode == "0") {
          if (arrOrder.length > 0)
            await this.dataAccessServiceService.archiveOrder(arrOrder);

          if (jsonObj.iMisaUpdates.FileCount > 0) {
            const fileNames: string[] = [];
            try {
              jsonObj.iMisaUpdates.FileNames.FileName.forEach((e) =>
                fileNames.push(e)
              );
            } catch {
              fileNames.push(jsonObj.iMisaUpdates.FileNames.FileName);
            }

            for (const element of fileNames) {
              const fileUrl = await this.prepareFileURL(element);
              await this.httpClient
                .get(fileUrl, { responseType: "text" })
                .subscribe(async (resp) => {
                  this.papa.parse(resp, {
                    newline: "\r\n",
                    complete: async (result) => {
                      switch (element.toLowerCase()) {
                        case "products":
                          await this.dataAccessServiceService.insertProductData(
                            result.data
                          );
                          break;
                        case "boundpcatcode":
                          await this.dataAccessServiceService.insertBoundPcatCodeData(
                            result.data
                          );
                          break;
                        case "accounts":
                          await this.dataAccessServiceService.insertAccountData(
                            result.data
                          );
                          break;
                        default:
                          break;
                      }
                    },
                  });
                });
            }
          }
        }
        await this.commonService.showAlertMessage(
          jsonObj.iMisaUpdates.StatusMessage,
          "iMisa"
        );
      });
    return true;
  }

  private async downloadAndProcessFile(fileName: string): Promise<void> {
    const fileUrl = await this.prepareFileURL(fileName);
    try {
      const csvText = await lastValueFrom(
        this.httpClient.get(fileUrl, { responseType: "text" })
      );
      const parsedResult = await new Promise<any>((resolve) => {
        this.papa.parse(csvText, {
          newline: "\r\n",
          complete: (result) => resolve(result),
        });
      });

      switch (fileName.toLowerCase()) {
        case "products":
          await this.dataAccessServiceService.insertProductData(
            parsedResult.data
          );
          break;
        case "boundpcatcode":
          await this.dataAccessServiceService.insertBoundPcatCodeData(
            parsedResult.data
          );
          break;
        case "accounts":
          await this.dataAccessServiceService.insertAccountData(
            parsedResult.data
          );
          break;
        default:
          console.warn(
            `Procesador no implementado para el archivo: ${fileName}`
          );
          break;
      }
    } catch (error) {
      console.error(
        `Error al descargar o procesar el archivo ${fileName}:`,
        error
      );
    }
  }

  async fetchAndSaveAllFiles(showLoader = false): Promise<boolean> {
    if (showLoader) {
      await this.commonService.showLoader("Lade Daten vom Server...");
    }

    // CORREGIDO: Las llamadas a los métodos REST ya no llevan el parámetro `deviceId`.
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
      console.error("Fallo al descargar uno o más archivos iniciales:", error);
      if (showLoader) await this.commonService.hideLoader();
      return false;
    }
  }
}
