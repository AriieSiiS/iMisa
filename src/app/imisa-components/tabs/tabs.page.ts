import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/imisa-services/order.service';
import { CommonService } from 'src/app/imisa-services/common.service';
import { ProductService } from 'src/app/imisa-services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderCommonService } from 'src/app/imisa-services/order-common.service';
//import {scanner} from "src/assets/JS/scanner.js";
declare var angularComponent: any;
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private commonService: CommonService,
    private orderCommonService: OrderCommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }


  ngOnInit() {
    angularComponent = this;
    this.commonService.isCamaraScanningEnabled().then(x => {
      this.commonService.canUseCameraScanning = x
    });
  }

  ngOnDestroy(): any {
    angularComponent = null;
  }

  async addOrder(barcode) {
    var result = await this.orderCommonService.addOrder(barcode);
    //this.commonService.showAlertMessage(this.activatedRoute.routeConfig.component.name,'iMisa 123' );
    if (result)
    {
      if (this.commonService.currentPresentedPage=='order') {
        this.router.navigateByUrl('tabs/settings', { skipLocationChange: true }).then(() => {
          this.router.navigate(['tabs']);
        });
      }
    }
  }
}


