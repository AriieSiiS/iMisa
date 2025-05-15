
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/imisa-services/order.service';
import { ProductService } from 'src/app/imisa-services/product.service';
import { OrderHistory } from 'src/app/models/order-history';
import { CommonService } from 'src/app/imisa-services/common.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage {
  canShowEdit: boolean = false;
  arrOrder: Order[] = [];
  IsHistoicalOrder: boolean = false;
  orderHistoryItem: OrderHistory;


  constructor(private router: Router,
    private orderService: OrderService,
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private commonService:CommonService) {
    }

  async ionViewWillEnter() {
    this.commonService.currentPresentedPage='order';
    await this.getHistoricalOrderDetailsFromRoute();
    this.populateOrder();
  }

  async EditOrder(order: Order) {
    let product = await this.productService.getProductById(order.boundPCatCode, order.code);

    let navExtras: NavigationExtras = {
      queryParams: {
        "articalItmDtls": JSON.stringify(product),
        "OrderItem": JSON.stringify(order),
        "IsEditOrder": true,
        "IsHistoricalOrder":this.IsHistoicalOrder
      }
    }
    if(!this.IsHistoicalOrder)
      this.router.navigate(['tabs/order/edit-order'], navExtras)
    else
      this.router.navigate(['tabs/orderhistory/edit-order'],navExtras);
  }

  ShowEditButtons() {
    if (!this.canShowEdit)
      this.canShowEdit = true;
    else
      this.canShowEdit = false;
  }

  async populateOrder() {
    var orderHistoryMasterId = 0;
    if (this.orderHistoryItem) {
      orderHistoryMasterId = this.orderHistoryItem.orderHistoryMasterId;
    }
    await this.orderService.getOrder(orderHistoryMasterId).then((x => {
      this.arrOrder = x;
    }))
  }

  async getHistoricalOrderDetailsFromRoute() {
    await this.activatedRoute.queryParams.subscribe(x => {
      if (x.IsHistoicalOrder) {
        this.IsHistoicalOrder = Boolean(JSON.parse(x.IsHistoicalOrder));
        this.orderHistoryItem = JSON.parse(x["orderHistoryItem"]);
      }
      // if (x.IsEditOrder=="true")
      // {
      //   this.order=JSON.parse(x.OrderItem);
      //   this.additionalDescription=this.order.additionaldesc;
      //   this.orderQty =this.order.amount;
      // }
    });
  }
  
  async deleteOrder(order:Order)
  {
      await this.orderService.deleteOrderItem(order.orderId);
      await this.populateOrder();
  }
}
