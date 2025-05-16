import { Component, OnInit } from "@angular/core";
import { Accounts } from "../../models/accounts";
import { AccountService } from "../../imisa-services/account.service";
import { CommonService } from "../../imisa-services/common.service";
import { NativestorageService } from "../../imisa-services/nativestorage.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
  standalone: false,
})
export class SettingsPage implements OnInit {
  arrAccounts: Accounts[];
  canScanUsingCamera: boolean = false;
  defultOrderAccountNumber: string = "";
  userName: string = "";
  serverUrl: string = "";
  restUser: string = "";
  restPassword: string = "";
  successMsg: string = "";

  constructor(
    private accountService: AccountService,
    private commonService: CommonService,
    private nativeStorageService: NativestorageService
  ) {}

  async ngOnInit() {
    this.serverUrl = await this.commonService.getServerUrl();
    this.restUser = await this.commonService.getRestUser();
    this.restPassword = await this.commonService.getRestPassword();
  }

  async ionViewWillEnter() {
    this.commonService.currentPresentedPage = "settings";
    await this.populateAccounts();
    await this.commonService.isCameraScanningEnabled().then((x) => {
      this.canScanUsingCamera = x;
    });
    await this.commonService.getOrderAccountNumber().then((x) => {
      this.defultOrderAccountNumber = x;
    });

    try {
      await this.nativeStorageService
        .getNativeValue(this.commonService.USER_INITIAL)
        .then(async (x) => {
          this.userName = x;
        });
    } catch (error) {
      this.userName = "";
    }

    this.serverUrl = await this.commonService.getServerUrl();
    this.restUser = await this.commonService.getRestUser();
    this.restPassword = await this.commonService.getRestPassword();
  }

  async populateAccounts() {
    this.arrAccounts = await this.accountService.getAccounts();
  }

  accoutVal(index: number, item: any) {
    return item.value;
  }

  async saveAccounts(event) {
    await this.nativeStorageService.setNativeValue(
      this.commonService.ORDER_ACCOUNT_NUMBER,
      event.detail.value
    );
  }

  async saveUserInitial(event) {
    await this.nativeStorageService.setNativeValue(
      this.commonService.USER_INITIAL,
      event.detail.value
    );
  }

  async SaveCameraScanSetting(event) {
    this.commonService.canUseCameraScanning = this.canScanUsingCamera;
    await this.nativeStorageService.setNativeValue(
      this.commonService.ENABLE_CAMERA_SCANNER,
      this.canScanUsingCamera
    );
  }

  async saveServerUrl(event) {
    this.serverUrl = event.detail.value;
    await this.commonService.setServerUrl(this.serverUrl);
    this.successMsg = "Server-URL wurde erfolgreich gespeichert!";
  }

  async saveRestUser(event) {
    this.restUser = event.detail.value;
    await this.commonService.setRestUser(this.restUser);
    this.successMsg = "Server Benutzername wurde erfolgreich gespeichert!";
    setTimeout(() => (this.successMsg = ""), 2000);
  }

  async saveRestPassword(event) {
    this.restPassword = event.detail.value;
    await this.commonService.setRestPassword(this.restPassword);
    this.successMsg = "RServer Passwort wurde erfolgreich gespeichert!";
    setTimeout(() => (this.successMsg = ""), 2000);
  }
}
