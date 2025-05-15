import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { OrderService } from 'src/app/imisa-services/order.service';
import { OrderHistory } from 'src/app/models/order-history';
import { CommonService } from 'src/app/imisa-services/common.service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
})
export class OrderHistoryPage implements OnInit {
  arrOrderHistory: OrderHistory[] = [];
  constructor(private router: Router,
    private orderService: OrderService,
    private commonService: CommonService) { }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.commonService.currentPresentedPage = 'order-history';
    await this.populateOrderHistory();
  }

  editOrderHistory(orderHistory: OrderHistory) {
    let navExtras: NavigationExtras = {
      queryParams: {
        //"articalItmDtls": JSON.stringify(orderHistory),
        "orderHistoryItem": JSON.stringify(orderHistory),
        "IsHistoicalOrder": true
      }
    }
    this.router.navigate(['tabs/orderhistory/order-history'], navExtras);
  }

  async populateOrderHistory() {

    this.arrOrderHistory = await this.orderService.getOrderHistory();
    //this.arrOrderHistory[0].products
  }

  async AddToOrder(orderHistoryItem: OrderHistory) {
    // get order history
    let arrOrderHistroy: Order[] = [];  

    await this.orderService.getOrder(orderHistoryItem.orderHistoryMasterId).then((x => {
      arrOrderHistroy = x;
    }));    

    if (arrOrderHistroy !== null && arrOrderHistroy.length > 0) {
      let orderItem;
      let orderAdded = false;
      for (var i = 0; i < arrOrderHistroy.length; i++) {        
        await this.orderService.addOrder(arrOrderHistroy[i]).then(() => {
          orderAdded = true;
        })              
      }

      if (orderAdded) {
        this.commonService.showMessage('Order added/updated successfully !');
      }
    }
  }

}
