import { Component, AfterViewInit, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
// import { OrderPage } from '../imisa-components/order/order.page';
import { RouterModule, Router } from '@angular/router';
import { UniqueDeviceID } from '@ionic-native/unique-device-id'
import { FileUpdatesService } from 'src/app/imisa-services/file-updates.service';
import { CommonService } from '../imisa-services/common.service';
import { DataAccessServiceService } from '../data-access/data-access-service.service';
import { Order } from '../models/order';
import { String, StringBuilder } from 'typescript-string-operations';
import { NativestorageService } from '../imisa-services/nativestorage.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit, OnInit {

  _uniqueDeviceId: string = '';
  ngOnInit(): void {
    // this.commonService.getDeviceId().then(
    //   (uuid: any) => {
    //     this.commonService.uniqueDeviceId = uuid;
    //     this._uniqueDeviceId =this.commonService.uniqueDeviceId;
    //   })
    this._uniqueDeviceId = this.commonService.uniqueDeviceId;
    this.commonService.checkOnlineStatus();
    //this.UpdateDefaultNativeSettings();
  }

  ngAfterViewInit(): void {
    this._uniqueDeviceId = this.commonService.uniqueDeviceId;
  }



  constructor(private router: Router, private fileUpdatesService: FileUpdatesService,
    private commonService: CommonService,
    private dataAccessServiceService: DataAccessServiceService,
    private nativeStorageService: NativestorageService) {

  }

  async UpdateDefaultNativeSettings() {
    this.nativeStorageService.getNativeValue(this.commonService.ENABLE_CAMERA_SCANNER).then(async (x) => {
      if (typeof x === typeof undefined) {
        await this.nativeStorageService.setNativeValue(this.commonService.ENABLE_CAMERA_SCANNER, false);
      }
    });
    this.nativeStorageService.getNativeValue(this.commonService.ORDER_ACCOUNT_NUMBER).then(async (x) => {
      if (typeof x === typeof undefined) {
        //TODO: populate account setting from accout table
        await this.nativeStorageService.setNativeValue(this.commonService.ORDER_ACCOUNT_NUMBER, "250");
      }
    });
    this.nativeStorageService.getNativeValue(this.commonService.USER_INITIAL).then(async (x) => {
      if (typeof x === typeof undefined) {
        await this.nativeStorageService.setNativeValue(this.commonService.USER_INITIAL, "SA");
      }
    });
  }

  async ShowOrders() {
    // this.fileUpdatesService.PostOrerToServer('');
    if (await this.commonService.isInternetAvailable) {
      await this.fileUpdatesService.PostOrerToServer('', [], '').then(async (res) => {
        //debugger;
        if(res)
        {
          this.router.navigateByUrl("tabs");
        }
        
        // 
      })
    }
    else {
      this.router.navigateByUrl("tabs");
    }
    //await this.UpdateDefaultNativeSettings();
  }

  async submitOrder() {
    if (await this.commonService.isInternetAvailable) {
      let userName: any;
      try {
        userName = await this.nativeStorageService.getNativeValue(this.commonService.USER_INITIAL).then(async (x) => {
          return x;
        });
      } catch (error) {
        userName = "";
      }

      
      if (typeof userName === typeof undefined || userName.length <= 0) {
        await this.commonService.showAlertMessage("Bitte geben Sie die Initialen des Benutzers in der App ein.", "iMisa");
        return;
      }
      var arrOrder: Order[] = [];
      let stringBuilder: StringBuilder = new StringBuilder();
      this.dataAccessServiceService.getOrderToSubmit().then(async (x) => {
        if (x.rows.length > 0) {
          for (var i = 0; i < x.rows.length; i++) {
            let order = new Order();

            var b = String.Format('{0};{1};{2};{3};{4};{5};{6}\r\n',
              x.rows.item(i).objectId,
              x.rows.item(i).boundPCatCode,
              x.rows.item(i).amount,
              x.rows.item(i).deliverydays,
              x.rows.item(i).additionaldesc,
              x.rows.item(i).fid,
              x.rows.item(i).accountno);
            stringBuilder.Append(b);

            order.orderId = x.rows.item(i).orderId;
            order.objectId = x.rows.item(i).objectId;
            order.boundPCatCode = x.rows.item(i).boundPCatCode;
            order.amount = x.rows.item(i).amount;
            order.deliverydays = x.rows.item(i).deliverydays;
            order.additionaldesc = x.rows.item(i).additionaldesc;
            order.fid = x.rows.item(i).fid;
            order.accountno = x.rows.item(i).accountno;
            order.code = x.rows.item(i).code;
            arrOrder.push(order);
          };
          let strCSVOrder = stringBuilder.ToString();
          await this.fileUpdatesService.PostOrerToServer(strCSVOrder, arrOrder, userName);
          //await this.commonService.showAlertMessage('Order saved successfully on server', 'iMisa');
        }
        else {
          await this.commonService.showAlertMessage('There are no orders to submit', 'iMisa');
        }
      });
    }
    else {
      this.commonService.showAlertMessage("Con not submit order as there is not internet", "iMisa");
    }
  }

  openSettings() {
    this.router.navigateByUrl("app-settings");
  }

  // ShowData (){
  //   let pr = this.dataAccessServiceService.getProduct('ALUCOL').then((r)=> {
  //     if(r.rows.length > 0) {
  //       let a= r.rows
  //      // r.rows.item(0).maxqty
  //       console.log(a);
  //     }
  //   });
  //   console.log(pr);
  // }

  // populateDeviceId(){
  //   UniqueDeviceID.get()
  //   .then((uuid: any) =>this._uniqueDeviceId=uuid)
  //   .catch((error: any) => console.log(error));
  // }
}
