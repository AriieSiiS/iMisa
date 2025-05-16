import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OrderHistory } from "../../../models/order-history";
import { Order } from "../../../models/order";

@Component({
  selector: "app-order-history-detail",
  templateUrl: "./order-history-detail.page.html",
  styleUrls: ["./order-history-detail.page.scss"],
  standalone: false,
})
export class OrderHistoryDetailPage implements OnInit {
  orderHistory: OrderHistory;
  products: Order[] = [];

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["orderHistoryItem"]) {
        this.orderHistory = JSON.parse(params["orderHistoryItem"]);
        this.products = this.orderHistory.products || [];
      }
    });
  }
}
