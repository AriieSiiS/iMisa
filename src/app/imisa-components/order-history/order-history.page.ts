import { Component, OnInit } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { OrderService } from "../../imisa-services/order.service";
import { OrderHistory } from "../../models/order-history";
import { CommonService } from "../../imisa-services/common.service";
import { Order } from "../../models/order";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-order-history",
  templateUrl: "./order-history.page.html",
  styleUrls: ["./order-history.page.scss"],
  standalone: false,
})
export class OrderHistoryPage implements OnInit {
  arrOrderHistory: OrderHistory[] = [];
  defaultBackLink = "/tabs/articals";
  constructor(
    private router: Router,
    private orderService: OrderService,
    private commonService: CommonService,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.commonService.currentPresentedPage = "order-history";
    await this.populateOrderHistory();
  }

  editOrderHistory(orderHistory: OrderHistory) {
    let navExtras: NavigationExtras = {
      queryParams: {
        orderHistoryItem: JSON.stringify(orderHistory),
        IsHistoicalOrder: true,
      },
    };
    this.router.navigate(["tabs/orderhistory/order-history-detail"], navExtras);
  }

  async populateOrderHistory() {
    this.arrOrderHistory = await this.orderService.getOrderHistory();
    //this.arrOrderHistory[0].products
  }
  async clearOrderHistory() {
    const alert = await this.alertController.create({
      header: "Verlauf löschen",
      message:
        "Sind Sie sicher, dass Sie den Verlauf wirklich löschen möchten?",
      buttons: [
        {
          text: "Abbrechen",
          role: "cancel",
        },
        {
          text: "Löschen",
          handler: async () => {
            await this.orderService.clearOrderHistory();
            await this.populateOrderHistory();
            this.commonService.showMessage("Der Verlauf wurde gelöscht.");
          },
        },
      ],
    });

    await alert.present();
  }

  async AddToOrder(orderHistoryItem: OrderHistory) {
    // Aquí tienes ya los productos del pedido histórico:
    const arrOrderHistory: Order[] = orderHistoryItem.products;

    if (arrOrderHistory && arrOrderHistory.length > 0) {
      let orderAdded = false;
      for (let item of arrOrderHistory) {
        await this.orderService.addOrder(item).then(() => {
          orderAdded = true;
        });
      }
      if (orderAdded) {
        this.commonService.showMessage(
          "Bestellung erfolgreich in den Warenkorb übernommen!"
        );
      }
    }
  }
}
