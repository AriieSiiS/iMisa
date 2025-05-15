import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/imisa-services/common.service';
import { Papa } from 'ngx-papaparse';
import { DataAccessServiceService } from '../data-access/data-access-service.service';
import { Order } from '../models/order';
@Injectable({
  providedIn: 'root'
})

export class FileUpdatesService {

  baseUrl: string = '';// = environment.baseUrl;
  constructor(private httpClient: HttpClient,
    private commonService: CommonService, private papa: Papa,
    private dataAccessServiceService: DataAccessServiceService) { }
  deviceId: string = this.commonService.uniqueDeviceId;
  serId: string = '100';
  version: string = environment.Version;
  appName = environment.AppName;
  userId: number = 1;

  // getUpdatesFromServer(): any {
  //   console.log('uniq id' + this.commonService.uniqueDeviceId);
  //   var reqHeader = new HttpHeaders({ 'Content-Type': 'application/xml' });
  //   let url = this.baseUrl + 'PostOrder/' + this.commonService.uniqueDeviceId + '_' + this.serId + '_'
  //     + this.version + '_' + this.appName + '_' + this.userId;
  //   this.httpClient.post(url, {}, { headers: reqHeader, responseType: 'text' }).subscribe((res) => {
  //     console.log(res);
  //     let jsonObj = this.commonService.converXMLtoJson(res);
  //     //@ts-ignore
  //     if (jsonObj.iMisaUpdates.StatusCode == '0') {
  //       //@ts-ignore
  //       jsonObj.iMisaUpdates.FileNames.FileName.forEach(element => {
  //         let url = this.prepareFileURL(element);
  //         this.httpClient.get(url, { responseType: "text" }).subscribe((resp) => {

  //           this.papa.parse(resp, {
  //             complete: (result) => {
  //               switch (element.toLowerCase()) {
  //                 case 'products':
  //                   this.dataAccessServiceService.insertProductData(result.data);
  //                   break;
  //                 case 'boundpcatcode':
  //                   this.dataAccessServiceService.insertBoundPcatCodeData(result.data);
  //                   break;

  //                 //TODO: add other files implementations 
  //                 default:
  //                   break;
  //               }
  //               //  console.log("parse", result)
  //             }
  //           })
  //         });
  //       });
  //     }
  //   });

  //   // this.commonService.getDeviceId().then(
  //   //   (uuid: any) => {
  //   //     this.deviceId = uuid
  //   //   }
  //   // )
  //   //   .catch((error: any) => console.log(error));
  // }


  async PostOrerToServer(orderData: string, arrOrder: Order[], initial: string) {
    await this.commonService.getServerUrl().then(x => { this.baseUrl = x })
    if (typeof this.baseUrl === typeof undefined || this.baseUrl.length <= 0) {
      await this.commonService.showAlertMessage("Server-URL fehlt. Bitte geben Sie die Server-URL in den App-Einstellungen ein.", "iMisa");
      return false;
    }
    var reqHeader = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let url = this.baseUrl + 'PostOrder/' + this.commonService.uniqueDeviceId + '_' + this.serId + '_'
      + this.version + '_' + this.appName + '_' + this.userId + '_' + initial;

    await this.httpClient.post(url, orderData, { headers: reqHeader, responseType: 'text' }).subscribe(async (res) => {
      let jsonObj: any = this.commonService.converXMLtoJson(res);
      //@ts-ignore

      if (jsonObj.iMisaUpdates.StatusCode == '0') {
        if (arrOrder.length > 0)
          await this.dataAccessServiceService.archiveOrder(arrOrder);
        //@ts-ignore
        if (jsonObj.iMisaUpdates.FileCount > 0) {
          var fileNames = new Array();
          try {
            jsonObj.iMisaUpdates.FileNames.FileName.forEach(element => {
              fileNames.push(element);
            });
          } catch (error) {
            fileNames.push(jsonObj.iMisaUpdates.FileNames.FileName);
          }
          //@ts-ignore          
          fileNames.forEach(async element => {
            let url = await this.prepareFileURL(element);
            await this.httpClient.get(url, { responseType: "text" }).subscribe(async (resp) => {
              this.papa.parse(resp, {
                complete: async (result) => {
                  switch (element.toLowerCase()) {
                    case 'products':
                      await this.dataAccessServiceService.insertProductData(result.data);
                      break;
                    case 'boundpcatcode':
                      await this.dataAccessServiceService.insertBoundPcatCodeData(result.data);
                      break;
                    case 'accounts':
                      await this.dataAccessServiceService.insertAccountData(result.data);
                      break;

                    //TODO: add other files implementations 
                    default:
                      break;
                  }
                  //  console.log("parse", result)
                },
                newline: "\r\n"
              })
            });
          });
        }
      }
      await this.commonService.showAlertMessage(jsonObj.iMisaUpdates.StatusMessage, "iMisa");
    });
    return true;
  }



  async prepareFileURL(fileName: string) {
    await this.commonService.getServerUrl().then(x => { this.baseUrl = x });
    let url = this.baseUrl + "Getfiles/" + this.commonService.uniqueDeviceId + '_Get' + fileName + '.axd';
    return url;
  }

}
