import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/imisa-services/order.service';
import { CommonService } from 'src/app/imisa-services/common.service';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.page.html',
  styleUrls: ['./item-edit.page.scss'],
})
export class ItemEditPage implements OnInit {
  artical: Product = new Product();
  order: Order = new Order();
  orderQty: number = 0;
  additionalDescription: string = ''
  IsEditOrder: boolean;
  IsHistoricalOrder: boolean = false;
  errorMessage: string = '';
  constructor(private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private commonService: CommonService,
    private router: Router) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.commonService.currentPresentedPage = 'artilcals';
    this.getArticaDetailsFromRoute();
    //var a = this.artical
  }

  getArticaDetailsFromRoute() {
    //debugger;
    this.activatedRoute.queryParams.subscribe(x => {
      try {
        this.IsEditOrder = Boolean(JSON.parse(x.IsEditOrder));
      } catch (error) {
        this.IsEditOrder = false;
      }

      this.artical = JSON.parse(x["articalItmDtls"]);
      this.orderQty = this.artical.minqty;
      try {
        this.IsHistoricalOrder = Boolean(JSON.parse(x.IsHistoricalOrder));
      } catch (error) {
        this.IsHistoricalOrder = false;
      }


      if (this.IsEditOrder == true) {
        this.order = JSON.parse(x.OrderItem);
        this.additionalDescription = this.order.additionaldesc;
        this.orderQty = this.order.amount;
      }

    });
  }

  async saveOrder() {
    debugger;
    if (this.orderQty >= this.artical.minqty && this.orderQty <= this.artical.maxqty) {
      if (this.IsEditOrder == false) {
        // save new order 
        let order = new Order();
        // order.orderHistoryId = 0;
        order.boundPCatCode = this.artical.boundPCatCode
        order.productDescription = this.artical.descinternal;
        order.code = this.artical.code;
        let orderAccountNo = this.commonService.getOrderAccountNumber();
        if (orderAccountNo) {
          order.accountno = (await orderAccountNo).toString();
        }
        else {
          order.accountno = '250';
        }
        order.additionaldesc = this.additionalDescription;
        order.amount = this.orderQty;
        order.deliverydays = 0; // TODO : fetch is from  setting table
        order.fid = 0;
        order.objectId = "MisaOrder";
        await this.orderService.addOrder(order).then(() => {
          this.commonService.showMessage('Bestellung erfolgreich gespeichert!');
          //Order saved successfully !
          this.router.navigate(['tabs/articals/artical-list']);
        })
      }
      else {
        //update existing item in the order
        this.order.amount = this.orderQty,
          this.order.additionaldesc = this.additionalDescription;
        await this.orderService.updateOrder(this.order).then(() => {
          this.commonService.showMessage('Bestellung erfolgreich gespeichert!');
          this.router.navigate(['tabs/order']);
        })
      }
    } else {
      await this.commonService.showAlertMessage("Die Bestellmenge sollte größer als die Mindestbestellmenge und kleiner als die maximale Bestellmenge sein. Bitte ändern Sie die Menge entsprechend.", "iMisa");
    }

  }
  async validateQuantity(event) {
    //debugger;
    this.errorMessage ="";
    if (Number(event.detail.value) < this.artical.minqty || Number(event.detail.value) > this.artical.maxqty) {
      this.errorMessage = "Die Menge sollte zwischen 20 "+ this.artical.minqty +" und 30 "+ this.artical.maxqty+" liegen.";
      //
    }
  }
}
