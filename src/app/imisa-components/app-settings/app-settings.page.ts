import { Component, OnInit } from "@angular/core";
import { CommonService } from "../../imisa-services/common.service";

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

  constructor(private commonService: CommonService) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.serverUrl = await this.commonService.getServerUrl();
    this.restUser = await this.commonService.getRestUser();
    this.restPassword = await this.commonService.getRestPassword();
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
}
