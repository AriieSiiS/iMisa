import { Injectable } from "@angular/core";
import { DataAccessServiceService } from "../data-access/data-access-service.service";
import { Order } from "../models/order";
import { OrderHistory } from "../models/order-history";
import { NativestorageService } from "./nativestorage.service";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(
    private dataAccessService: DataAccessServiceService,
    private nativeStorageService: NativestorageService
  ) {}

  /* -------------------------------------------------------
   * IN‑MEMORY STATE (modo sin DB)
   * ----------------------------------------------------- */
  private _orders: Order[] = [];
  private _nextId = 1;
  private _orderHistory: OrderHistory[] = [];
  private _orderHistoryNextId = 1;

  async addOrder(order: Order): Promise<void> {
    const existing = this._orders.find(
      (o) =>
        o.code === order.code &&
        (o.additionaldesc || "").toLowerCase() ===
          (order.additionaldesc || "").toLowerCase()
    );

    if (existing) {
      existing.amount =
        (Number(existing.amount) || 0) + (Number(order.amount) || 0);
      return;
    }

    order.orderId = this._nextId++;
    order.dateadded = new Date();
    this._orders.push({ ...order });
  }

  // En OrderService
  async saveOrderToHistory(orderList: Order[], userName: string) {
    if (!orderList || orderList.length === 0) return;

    // Leer historial actual de NativeStorage
    let historial: OrderHistory[] = [];
    try {
      historial = await this.nativeStorageService.getNativeValue(
        "orderHistory"
      );
    } catch {
      historial = [];
    }

    if (!Array.isArray(historial)) {
      historial = [];
    }
    // Añade el nuevo pedido
    historial.push({
      orderHistoryMasterId: Date.now(), // o un contador propio
      dateadded: new Date(),
      products: [...orderList],
    });

    // Guarda de nuevo en NativeStorage
    await this.nativeStorageService.setNativeValue("orderHistory", historial);
  }
  /** Actualiza la línea en memoria */
  async updateOrder(order: Order): Promise<void> {
    const idx = this._orders.findIndex((o) => o.orderId === order.orderId);
    if (idx > -1) {
      this._orders[idx] = { ...order };
    }
  }

  async clearOrderHistory() {
    await this.nativeStorageService.setNativeValue("orderHistory", []);
  }

  /** Devuelve copia del pedido en curso (sin DB) */
  async getOrder(orderHistoryMasterId: number = 0): Promise<Order[]> {
    return [...this._orders];
  }

  /* ------------------- DELETE ------------------------- */
  async deleteOrderItem(orderId: number): Promise<void> {
    this._orders = this._orders.filter((o) => o.orderId !== orderId);
  }

  /* ------------------- CLEAR -------------------------- */
  async clearAll(): Promise<void> {
    this._orders = [];
    this._nextId = 1;
  }

  /* ------------------- HISTORY ------------------------ */
  // Versión SQLite ↓
  // async getOrderHistory() {
  //   let arrOrderHistory: OrderHistory[] = [];
  //   await this.dataAccessService.getOrderHistory().then((r) => {
  //     if (r.rows.length > 0) {
  //       for (var i = 0; i <= r.rows.length - 1; i++) {
  //         arrOrderHistory.push(this.populateOrderHistoryTypeFromDBObject(r.rows.item(i)));
  //       }
  //     }
  //   });
  //   return arrOrderHistory;
  // }

  async getOrderHistory(): Promise<OrderHistory[]> {
    try {
      const historial = await this.nativeStorageService.getNativeValue(
        "orderHistory"
      );
      return historial || [];
    } catch {
      return [];
    }
  }

  /* ------------------- Helpers ------------------------ */
  populateOrderTypeFromDBObject(dbObj: any): Order {
    const order = new Order();
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

  populateOrderHistoryTypeFromDBObject(dbObj: any): OrderHistory {
    const orderHistory = new OrderHistory();
    //order.orderHistoryId = dbObj.orderHistoryId;
    orderHistory.orderHistoryMasterId = dbObj.orderHistoryMasterId;
    orderHistory.dateadded = dbObj.dateadded;
    orderHistory.products = dbObj.products;
    return orderHistory;
  }
}
