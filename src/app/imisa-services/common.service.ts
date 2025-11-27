import { Injectable } from "@angular/core";
import { XMLParser } from "fast-xml-parser";
import {
  ToastController,
  LoadingController,
  AlertController,
  Platform,
} from "@ionic/angular";
import { NativestorageService } from "./nativestorage.service";
import { Network } from "@awesome-cordova-plugins/network/ngx";
import { Device } from "@awesome-cordova-plugins/device/ngx";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  public uniqueDeviceId: string;
  public isInternetAvailable: boolean;
  public canUseCameraScanning: boolean = false;
  public currentPresentedPage: string;

  // Constantes de configuración
  public readonly ENABLE_CAMERA_SCANNER = "ENABLE_CAMERA_SCANNER";
  public readonly ORDER_ACCOUNT_NUMBER = "ORDER_ACCOUNT_NUMBER";
  public readonly USER_INITIAL = "USER_INITIAL";
  public readonly SERVER_URL = "API_SERVER_URL";
  public readonly REST_USER = "REST_USER";
  public readonly REST_PASSWORD = "REST_PASSWORD";
  public readonly LAST_SYNC_DATE = "LAST_SYNC_DATE";
  public readonly AUTO_SYNC_DAYS = 7; // Días entre sincronizaciones automáticas
  public CURRNET_BOUND_PCAT_CODE = -1;

  private initializationCompleted: Promise<void>;

  constructor(
    private toastController: ToastController,
    public loadingController: LoadingController,
    private nativestorageService: NativestorageService,
    private alertController: AlertController,
    private network: Network,
    private platform: Platform,
    private device: Device
  ) {
    this.initializationCompleted = this.initialize();
  }

  public async ensureInitialized(): Promise<void> {
    return this.initializationCompleted;
  }

  private async initialize(): Promise<void> {
    try {
      await this.platform.ready();

      await this.initializeDeviceId();
      this.initializeNetworkEvents();
      await this.initializeDefaultSettings();
      await this.loadCameraSetting();
    } catch (error) {}
  }

  private async initializeDeviceId(): Promise<void> {
    if (this.platform.is("cordova")) {
      try {
        this.uniqueDeviceId = this.device.uuid || "NO-DEVICEID-FALLBACK";
        await this.nativestorageService.setNativeValue(
          "deviceId",
          this.uniqueDeviceId
        );
      } catch (e) {
        const saved = await this.nativestorageService.getNativeValue(
          "deviceId"
        );
        this.uniqueDeviceId = saved || "NO-DEVICEID-ON-ERROR";
      }
    } else {
      this.uniqueDeviceId = "mock-device-id-browser-123";
    }
  }

  public async getDeviceId(): Promise<string> {
    await this.ensureInitialized();
    return this.uniqueDeviceId;
  }

  private initializeNetworkEvents(): void {
    if (this.platform.is("cordova") && this.network) {
      this.isInternetAvailable = this.network.type !== "none";
      this.network.onConnect().subscribe(() => {
        this.isInternetAvailable = true;
      });
      this.network.onDisconnect().subscribe(() => {
        this.isInternetAvailable = false;
      });
    } else {
      this.isInternetAvailable = navigator.onLine;
      window.addEventListener("online", () => {
        this.isInternetAvailable = true;
      });
      window.addEventListener("offline", () => {
        this.isInternetAvailable = false;
      });
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    const settingsToSet = [
      { key: this.ENABLE_CAMERA_SCANNER, value: false },
      { key: this.ORDER_ACCOUNT_NUMBER, value: "250" },
      { key: this.USER_INITIAL, value: "SA" },
    ];

    for (const setting of settingsToSet) {
      try {
        const existingValue = await this.nativestorageService.getNativeValue(
          setting.key
        );
        if (existingValue === null || typeof existingValue === "undefined") {
          await this.nativestorageService.setNativeValue(
            setting.key,
            setting.value
          );
        }
      } catch (e) {
        await this.nativestorageService.setNativeValue(
          setting.key,
          setting.value
        );
      }
    }
  }

  private async loadCameraSetting(): Promise<void> {
    try {
      const res = await this.nativestorageService.getNativeValue(
        this.ENABLE_CAMERA_SCANNER
      );
      this.canUseCameraScanning = !!res;
    } catch (e) {
      this.canUseCameraScanning = false;
    }
  }

  public async getServerUrl(): Promise<string> {
    await this.ensureInitialized();
    try {
      return (
        (await this.nativestorageService.getNativeValue(this.SERVER_URL)) || ""
      );
    } catch (error) {
      return "";
    }
  }

  public async setServerUrl(url: string): Promise<void> {
    await this.ensureInitialized();
    await this.nativestorageService.setNativeValue(this.SERVER_URL, url);
  }

  public async getRestUser(): Promise<string> {
    await this.ensureInitialized();
    return (
      (await this.nativestorageService.getNativeValue(this.REST_USER)) || ""
    );
  }

  public async setRestUser(user: string): Promise<void> {
    await this.ensureInitialized();
    await this.nativestorageService.setNativeValue(this.REST_USER, user);
  }

  public async getRestPassword(): Promise<string> {
    await this.ensureInitialized();
    return (
      (await this.nativestorageService.getNativeValue(this.REST_PASSWORD)) || ""
    );
  }

  public async setRestPassword(password: string): Promise<void> {
    await this.ensureInitialized();
    await this.nativestorageService.setNativeValue(
      this.REST_PASSWORD,
      password
    );
  }

  public converXMLtoJson(strXML: string): any {
    const parser = new XMLParser();
    return parser.parse(strXML);
  }

  public async showMessage(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      color: "success",
      position: "bottom",
    });
    await toast.present();
  }

  public async showErrorMessage(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color: "danger",
      position: "top",
    });
    await toast.present();
  }

  public async showLoader(message: string = "Bitte warten..."): Promise<void> {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      message: message,
      translucent: true,
      backdropDismiss: false,
    });
    await loading.present();
  }

  public async hideLoader(): Promise<void> {
    try {
      await this.loadingController.dismiss();
    } catch (e) {}
  }

  public async showAlertMessage(message: string, title: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons: ["OK"],
    });
    await alert.present();
  }

  public async getOrderAccountNumber(): Promise<string> {
    await this.ensureInitialized();
    try {
      return (
        (await this.nativestorageService.getNativeValue(
          this.ORDER_ACCOUNT_NUMBER
        )) || ""
      );
    } catch (error) {
      return "";
    }
  }

  public async isCameraScanningEnabled(): Promise<boolean> {
    await this.ensureInitialized();
    return this.canUseCameraScanning;
  }

  public async getLastSyncDate(): Promise<Date | null> {
    await this.ensureInitialized();
    try {
      const dateString = await this.nativestorageService.getNativeValue(
        this.LAST_SYNC_DATE
      );
      return dateString ? new Date(dateString) : null;
    } catch (error) {
      return null;
    }
  }

  public async setLastSyncDate(date: Date = new Date()): Promise<void> {
    await this.ensureInitialized();
    await this.nativestorageService.setNativeValue(
      this.LAST_SYNC_DATE,
      date.toISOString()
    );
  }

  public async shouldAutoSync(): Promise<boolean> {
    const lastSync = await this.getLastSyncDate();

    // Si nunca se ha sincronizado, no forzar (mantener datos existentes)
    if (!lastSync) {
      return false;
    }

    // Calcular días desde última sincronización
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays >= this.AUTO_SYNC_DAYS;
  }
}
