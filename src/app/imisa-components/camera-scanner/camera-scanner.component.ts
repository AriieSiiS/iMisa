import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx'
import { AlertController } from '@ionic/angular';
import { CommonService } from 'src/app/imisa-services/common.service';
import { Product } from 'src/app/models/product';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/imisa-services/order.service';
import { ProductService } from 'src/app/imisa-services/product.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router'
import { OrderCommonService } from 'src/app/imisa-services/order-common.service';

@Component({
  selector: 'app-camera-scanner',
  templateUrl: './camera-scanner.component.html',
  styleUrls: ['./camera-scanner.component.scss'],
})
export class CameraScannerComponent implements OnInit {

  constructor(private barcodeScanner: BarcodeScanner,
    private orderCommonService: OrderCommonService,
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {


   }

   ngOnDestroy(): any {
   
  }

  //canScanUsingCamera:boolean=this.commonService.canUseCameraScanning;

  async scanBarcode() {
    this.barcodeScanner.scan().then(async res => {
      this.addOrder(res.text);
    })
  }

  async addOrder(barcode) {
    var result = await this.orderCommonService.addOrder(barcode);
    if (result)
    {
      if (this.commonService.currentPresentedPage=='order') {
        this.router.navigateByUrl('tabs/settings', { skipLocationChange: true }).then(() => {
          this.router.navigate(['tabs']);
        });
      }
    }
  }

  // async addOrder(barcode) {
  //   if (this.commonService.CURRNET_BOUND_PCAT_CODE < 0) {
  //     await this.commonService.showAlertMessage('Please select artical before scanning item','iMisa'); 
  //   }
  //   else {
  //     var boundPCatCode = this.commonService.CURRNET_BOUND_PCAT_CODE;
  //     let product: Product;
  //     await this.productService.getProductById(boundPCatCode,barcode).then(async (res) => {
  //       product = res;
  //       await this.addArticalInOrder(product);
  //       //Amar:-  refresh page. Need to find better way to refresh page
  //       if(this.activatedRoute.routeConfig.component.name=='OrderPage')
  //       {
  //         let navExtras :NavigationExtras= {
  //           queryParams:{
  //             "date": Date.now()
  //           }
  //         }
  //         this.router.navigateByUrl('tabs/settings', { skipLocationChange: true }).then(() => {
  //         this.router.navigate(['tabs'],navExtras);
  //     }); 
  //       }
  //      });
  //   }
  // }

  // async  addArticalInOrder(artical: Product) {
  //   let order = new Order();
  //   order.code = artical.code;
  //   order.boundPCatCode = artical.boundPCatCode;
  //   //order.accountno = '250'; // Amar: It will be overriden while saving in DB
  //   //order.additionaldesc = artical.descinternal;
  //   order.amount = artical.defaultqty;
  //   order.deliverydays = 0; // TODO : fetch is from  setting table
  //   order.fid = 0;
  //   order.objectId = "MisaOrder";
  //   await this.orderService.addOrder(order).then(() => {
  //     this.commonService.showMessage('Order saved successfully !');
  //   })
  // }

}
