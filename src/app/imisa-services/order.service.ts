import { Injectable } from "@angular/core";
import { DataAccessServiceService } from "../data-access/data-access-service.service";
import { Order } from "../models/order";
import { OrderHistory } from "../models/order-history";
import { NativestorageService } from "./nativestorage.service";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(private nativeStorageService: NativestorageService) {}

  private _orders: Order[] = [];
  private _nextId = 1;
  private _orderHistory: OrderHistory[] = [];

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

  async saveOrderToHistory(orderList: Order[], userName: string) {
    if (!orderList || orderList.length === 0) return;

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
    historial.push({
      orderHistoryMasterId: Date.now(),
      dateadded: new Date(),
      products: [...orderList],
    });

    await this.nativeStorageService.setNativeValue("orderHistory", historial);
  }

  async updateOrder(order: Order): Promise<void> {
    const idx = this._orders.findIndex((o) => o.orderId === order.orderId);
    if (idx > -1) {
      this._orders[idx] = { ...order };
    }
  }

  async clearOrderHistory() {
    await this.nativeStorageService.setNativeValue("orderHistory", []);
  }

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
}
