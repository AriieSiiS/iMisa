import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/imisa-services/common.service';
import { NativestorageService } from 'src/app/imisa-services/nativestorage.service';

@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.page.html',
  styleUrls: ['./app-settings.page.scss'],
})
export class AppSettingsPage implements OnInit {
  serverUrl: string;
  constructor(private commonService: CommonService,
    private nativeStorageService: NativestorageService) { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    //debugger;
    await this.commonService.getServerUrl().then(x => { this.serverUrl = x });

  }
  async saveServerUrl(event) {
    await this.nativeStorageService.setNativeValue(this.commonService.SERVER_URL, event.detail.value)
  }
}
