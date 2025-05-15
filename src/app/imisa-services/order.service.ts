import { Injectable } from '@angular/core';
import { DataAccessServiceService } from '../data-access/data-access-service.service';
import { Order } from '../models/order';
import { CommonService } from './common.service';
import { OrderHistory } from '../models/order-history';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private dataAccessService: DataAccessServiceService) { }

  // async addOrder(order: Order) {
  //   let arrOrder: Order[] = [];
  //   await this.dataAccessService.insertOrderData(order).then((res) => {
  //       this.getOrder(0).then((x)=>{
  //         arrOrder=x;
  //     })
  //   });
  // }


  async addOrder(order: Order) {
    let arrOrder: Order[] = [];
    await this.getOrder(0).then((x => {
      arrOrder = x;
    }));
    let orderItem = arrOrder.find(x => x.orderId === order.orderId);
    if ((orderItem === null || orderItem === undefined) && order.additionaldesc) {
      orderItem = arrOrder.find(x => x.code === order.code && x.additionaldesc
        && x.additionaldesc.toLowerCase() === order.additionaldesc.toLowerCase());
    }else if((orderItem === null || orderItem === undefined))
    {
      orderItem = arrOrder.find(x => x.code === order.code);
    }
    if (orderItem === null || orderItem === undefined) {
      return this.dataAccessService.insertOrderData(order);
    }
    else {
      orderItem.amount = (parseInt(orderItem.amount.toString()) + parseInt(order.amount.toString()));
      return this.updateOrder(orderItem);
    }
  }

  updateOrder(order: Order) {
    return this.dataAccessService.updateOrder(order);
  }

  async getOrder(orderHistoryMasterId: number = 0) {
    let arrOrder: Order[] = [];
    await this.dataAccessService.getOrder(orderHistoryMasterId).then((r) => {
      if (r.rows.length > 0) {
        for (var i = 0; i <= r.rows.length - 1; i++) {
          arrOrder.push(this.populateOrderTypeFromDBObject(r.rows.item(i)));
        }
      }
    });
    return arrOrder;
  }

  populateOrderTypeFromDBObject(dbObj: any): Order {
    var order = new Order();
    //order.orderHistoryId = dbObj.orderHistoryId;
    order.code = dbObj.code;
    order.accountno = dbObj.accountno;
    order.additionaldesc = dbObj.additionaldesc;
    order.amount = dbObj.amount;
    order.dateadded = dbObj.dateadded;
    order.deliverydays = dbObj.deliverydays;
    order.fid = dbObj.fid;
    order.objectId = dbObj.objectId;
    order.productDescription = dbObj.productDescription;
    order.boundPCatCode = dbObj.boundPCatCode;
    order.orderId = dbObj.orderId;
    return order;
  }

  async getOrderHistory() {

    let arrOrderHistory: OrderHistory[] = [];
    await this.dataAccessService.getOrderHistory().then((r) => {
      if (r.rows.length > 0) {
        for (var i = 0; i <= r.rows.length - 1; i++) {
          arrOrderHistory.push(this.populateOrderHistoryTypeFromDBObject(r.rows.item(i)));
        }
      }
    });
    return arrOrderHistory;
  }


  populateOrderHistoryTypeFromDBObject(dbObj: any): OrderHistory {
    var orderHistory = new OrderHistory();
    //order.orderHistoryId = dbObj.orderHistoryId;
    orderHistory.orderHistoryMasterId = dbObj.orderHistoryMasterId;
    orderHistory.dateadded = dbObj.dateadded;
    orderHistory.products = dbObj.products;

    return orderHistory;
  }

  async deleteOrderItem(orderId: number) {
    await this.dataAccessService.deleteOrderItem(orderId);
  }


}
