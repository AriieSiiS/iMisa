import { Component, OnInit } from "@angular/core";
import { CommonService } from "../../imisa-services/common.service";
import { NativestorageService } from "../../imisa-services/nativestorage.service";

@Component({
  selector: "app-app-settings",
  templateUrl: "./app-settings.page.html",
  styleUrls: ["./app-settings.page.scss"],
  standalone: false,
})
export class AppSettingsPage implements OnInit {
  serverUrl: string;
  restUser: string;
  restPassword: string;
  defaultBackLink = "/tabs/articals";
  successMsg: string = "";

  // Lagerort por dispositivo (NUEVO)
  private readonly WAREHOUSE_LOCATION_KEY = "warehouse_location";
  warehouseLocation: number | null = null;

  constructor(
    private commonService: CommonService,
    private nativeStorage: NativestorageService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.serverUrl = await this.commonService.getServerUrl();
    this.restUser = await this.commonService.getRestUser();
    this.restPassword = await this.commonService.getRestPassword();

    // Cargar Lagerort guardado (si existe)
    try {
      const v = await this.nativeStorage.getNativeValue(
        this.WAREHOUSE_LOCATION_KEY
      );
      this.warehouseLocation =
        v !== null && v !== undefined && v !== "" ? Number(v) : null;
    } catch {
      this.warehouseLocation = null;
    }
  }

  async saveServerUrl(event) {
    this.serverUrl = event.detail.value;
    await this.commonService.setServerUrl(this.serverUrl);
    this.successMsg = "Server-URL wurde erfolgreich gespeichert!";
    setTimeout(() => (this.successMsg = ""), 2000);
  }

  async saveRestUser(event) {
    this.restUser = event.detail.value;
    await this.commonService.setRestUser(this.restUser);
    this.successMsg = "REST-Server Benutzername wurde erfolgreich gespeichert!";
    setTimeout(() => (this.successMsg = ""), 2000);
  }

  async saveRestPassword(event) {
    this.restPassword = event.detail.value;
    await this.commonService.setRestPassword(this.restPassword);
    this.successMsg = "REST-Server Passwort wurde erfolgreich gespeichert!";
    setTimeout(() => (this.successMsg = ""), 2000);
  }

  // Guardar Lagerort (NUEVO) — mismo patrón de onChange(event)
  async saveWarehouseLocation(event) {
    const val = (event?.detail?.value ?? "").toString().trim();
    const num =
      val === "" || val === null || val === undefined ? null : Number(val);

    if (num !== null && Number.isNaN(num)) {
      this.successMsg = "Ungültiger Lagerort (nur Zahl erlaubt).";
      setTimeout(() => (this.successMsg = ""), 2000);
      return;
    }

    this.warehouseLocation = num;
    await this.nativeStorage.setNativeValue(this.WAREHOUSE_LOCATION_KEY, num);
    this.successMsg = "Entnahmelagerort wurde erfolgreich gespeichert!";
    setTimeout(() => (this.successMsg = ""), 2000);
  }
}
