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
    // Inicia la inicialización en segundo plano. No bloquea el constructor.
    this.initializationCompleted = this.initialize();
  }

  /**
   * Método público para que otros componentes/servicios esperen a que este servicio esté listo.
   */
  public async ensureInitialized(): Promise<void> {
    return this.initializationCompleted;
  }

  /**
   * Lógica de inicialización principal. Se ejecuta una sola vez al crear el servicio.
   */
  private async initialize(): Promise<void> {
    try {
      await this.platform.ready();
      console.log(
        "CommonService: Plataforma lista, iniciando inicialización de plugins..."
      );

      // Ejecuta las tareas de inicialización en secuencia.
      // Estos métodos internos NO deben llamar a ensureInitialized().
      await this.initializeDeviceId();
      this.initializeNetworkEvents(); // No necesita 'await' porque solo configura listeners
      await this.initializeDefaultSettings();
      await this.loadCameraSetting();

      console.log("CommonService: Plugins inicializados correctamente.");
    } catch (error) {
      console.error(
        "CommonService: Error CRÍTICO durante la inicialización:",
        error
      );
      // Opcional: relanzar el error si la app no puede funcionar sin esta inicialización
      // throw error;
    }
  }

  /**
   * Obtiene y establece el ID del dispositivo. SOLO para ser llamado desde initialize().
   */
  private async initializeDeviceId(): Promise<void> {
    if (this.platform.is("cordova")) {
      try {
        this.uniqueDeviceId = this.device.uuid || "NO-DEVICEID-FALLBACK";
        await this.nativestorageService.setNativeValue(
          "deviceId",
          this.uniqueDeviceId
        );
        console.log(
          "[CommonService] DeviceId inicializado:",
          this.uniqueDeviceId
        );
      } catch (e) {
        console.error(
          "[CommonService] Error al obtener deviceId desde el plugin, intentando fallback desde storage:",
          e
        );
        // Como fallback, intenta leer uno que ya estuviera guardado
        const saved = await this.nativestorageService.getNativeValue(
          "deviceId"
        );
        this.uniqueDeviceId = saved || "NO-DEVICEID-ON-ERROR";
      }
    } else {
      this.uniqueDeviceId = "mock-device-id-browser-123";
      console.log(
        "[CommonService] Usando mock-device-id (no-cordova):",
        this.uniqueDeviceId
      );
    }
  }

  /**
   * Expone públicamente el deviceId, asegurando que la inicialización se haya completado.
   */
  public async getDeviceId(): Promise<string> {
    await this.ensureInitialized();
    return this.uniqueDeviceId;
  }

  /**
   * Configura los listeners de red. SOLO para ser llamado desde initialize().
   */
  private initializeNetworkEvents(): void {
    if (this.platform.is("cordova") && this.network) {
      this.isInternetAvailable = this.network.type !== "none";
      this.network.onConnect().subscribe(() => {
        this.isInternetAvailable = true;
        console.log("Red conectada.");
      });
      this.network.onDisconnect().subscribe(() => {
        this.isInternetAvailable = false;
        console.log("Red desconectada.");
      });
    } else {
      this.isInternetAvailable = navigator.onLine;
      window.addEventListener("online", () => {
        this.isInternetAvailable = true;
        console.log("Navegador: online.");
      });
      window.addEventListener("offline", () => {
        this.isInternetAvailable = false;
        console.log("Navegador: offline.");
      });
    }
  }

  /**
   * Establece valores por defecto en el almacenamiento nativo si no existen.
   * SOLO para ser llamado desde initialize().
   */
  private async initializeDefaultSettings(): Promise<void> {
    console.log("Verificando y estableciendo valores nativos por defecto.");
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
        // El error puede significar que no existe, lo cual es el escenario que queremos para setearlo
        await this.nativestorageService.setNativeValue(
          setting.key,
          setting.value
        );
      }
    }
  }

  /**
   * Carga la configuración de la cámara. SOLO para ser llamado desde initialize().
   */
  private async loadCameraSetting(): Promise<void> {
    try {
      const res = await this.nativestorageService.getNativeValue(
        this.ENABLE_CAMERA_SCANNER
      );
      this.canUseCameraScanning = !!res; // Convierte a booleano de forma segura
    } catch (e) {
      console.error(
        "[NativeStorage] Error al obtener ENABLE_CAMERA_SCANNER, se asume 'false':",
        e
      );
      this.canUseCameraScanning = false;
    }
  }

  // --- MÉTODOS PÚBLICOS (Helpers y Getters/Setters) ---
  // Estos métodos SÍ deben usar ensureInitialized para garantizar que todo está listo.

  public async getServerUrl(): Promise<string> {
    await this.ensureInitialized();
    try {
      return (
        (await this.nativestorageService.getNativeValue(this.SERVER_URL)) || ""
      );
    } catch (error) {
      console.error("[NativeStorage] Error al obtener SERVER_URL:", error);
      return "";
    }
  }

  public async setServerUrl(url: string): Promise<void> {
    await this.ensureInitialized();
    await this.nativestorageService.setNativeValue(this.SERVER_URL, url);
  }

  // (Aquí irían el resto de tus getters/setters como getRestUser, setRestUser, etc. todos con `await this.ensureInitialized()`)

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

  // --- MÉTODOS DE UTILIDAD (UI) ---
  // Estos no dependen de la inicialización de plugins, por lo que no necesitan `ensureInitialized`.

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
    } catch (e) {
      // Ignorar error si el loader ya fue descartado.
    }
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
      console.error(
        "[NativeStorage] Error al obtener ORDER_ACCOUNT_NUMBER:",
        error
      );
      return "";
    }
  }

  public async isCameraScanningEnabled(): Promise<boolean> {
    await this.ensureInitialized();
    return this.canUseCameraScanning;
  }
}
