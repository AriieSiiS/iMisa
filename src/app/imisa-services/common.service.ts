import { Injectable } from '@angular/core';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { NgxXml2jsonService } from 'ngx-xml2json'
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { NativestorageService } from './nativestorage.service';
import { Network } from '@ionic-native/network/ngx';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  uniqueDeviceId: string = '43c80547-c002-861c-3582-400511111108';
  isInternetAvailable: boolean;
  ENABLE_CAMERA_SCANNER = "ENABLE_CAMERA_SCANNER";
  ORDER_ACCOUNT_NUMBER = "ORDER_ACCOUNT_NUMBER";
  USER_INITIAL = "USER_INITIAL";
  SERVER_URL="API_SERVER_URL";
  CURRNET_BOUND_PCAT_CODE = -1;
  canUseCameraScanning: boolean = false;
  currentPresentedPage: string;

  constructor(private xmlToJsonConverter: NgxXml2jsonService,
    private toastController: ToastController,
    public loadingController: LoadingController,
    private nativestorageService: NativestorageService,
    private alertController: AlertController,
    private network: Network) {

    this.getDeviceId()
  }

  async getDeviceId() {
    return await UniqueDeviceID.get();
  }

  async isCamaraScanningEnabled() {
    let res: boolean = false;
    try {
      await this.nativestorageService.getNativeValue(this.ENABLE_CAMERA_SCANNER).then(x => { res = x });
    } catch (error) {
      res = false;
    }
    this.canUseCameraScanning = res;
    return res;
  }

  async getOrderAccountNumber() {
    let res: string = '';
    try {
      await this.nativestorageService.getNativeValue(this.ORDER_ACCOUNT_NUMBER).then(x => { res = x })
    } catch (error) {
      res = '';
    }

    return res;
  }

  async getServerUrl()
  {
    let serverUrl: string = '';
    try {
      await this.nativestorageService.getNativeValue(this.SERVER_URL).then(x => { serverUrl = x })
    } catch (error) {
      serverUrl = '';
    }
    return serverUrl;
  }

  converXMLtoJson(strXML: string) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(strXML, 'text/xml');
    const JsonObj = this.xmlToJsonConverter.xmlToJson(xml);
    //onsole.log(JsonObj);
    return JsonObj;
  }

  async showMessage(massage: string) {
    const toast = await this.toastController.create({
      message: massage,
      duration: 900,
      color: 'success',
      position: 'bottom'

    });
    toast.present();
  }

  async showErrorMessage(massage: string) {
    const toast = await this.toastController.create({
      message: massage,
      duration: 1000,
      color: 'danger',
      position: 'top'

    });
    toast.present();
  }
  async showLoader() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
  }
  async hideLoader() {
    await this.loadingController.dismiss();
  }

  UpdateDefaultNativeSettings() {
    console.log('updated default native settings');
    this.nativestorageService.setNativeValue(this.ENABLE_CAMERA_SCANNER, false);
    this.nativestorageService.setNativeValue(this.ORDER_ACCOUNT_NUMBER, "250");
  }


  async showAlertMessage(mesasage, title) {
    const alert = await this.alertController.create({
      header: title,
      message: mesasage,
      buttons: ['OK']
    });

    await alert.present();
  }

  async checkOnlineStatus() {
    this.isInternetAvailable = false;
    let isOnline: boolean = false;
    await this.network.onConnect().subscribe(async () => {
      this.isInternetAvailable = true;
    });

    await this.network.onDisconnect().subscribe(async () => {
      this.isInternetAvailable = false;
    });
    // return isOnline;
  }

}
