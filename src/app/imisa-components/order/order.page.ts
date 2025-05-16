import { Component } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { Order } from "../../models/order";
import { OrderService } from "../../imisa-services/order.service";
import { OrderHistory } from "../../models/order-history";
import { CommonService } from "../../imisa-services/common.service";
import { BoundPcatService } from "../../imisa-services/bound-pcat.service"; // Asegúrate de tenerlo en el constructor

@Component({
  selector: "app-order",
  templateUrl: "./order.page.html",
  styleUrls: ["./order.page.scss"],
  standalone: false,
})
export class OrderPage {
  canShowEdit: boolean = false;
  arrOrder: Order[] = [];
  IsHistoicalOrder: boolean = false;
  orderHistoryItem: OrderHistory;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private boundPcatService: BoundPcatService
  ) {}

  async ionViewWillEnter() {
    this.commonService.currentPresentedPage = "order";
    await this.getHistoricalOrderDetailsFromRoute();
    this.populateOrder();
  }

  async EditOrder(order: Order) {
    let boundPCatDesc = "";
    try {
      const boundCats = await this.boundPcatService.getArticals();
      const cat = boundCats.find(
        (c) => c.boundPCatCode === order.boundPCatCode
      );
      if (cat) {
        boundPCatDesc = cat.descinternal;
      }
    } catch (error) {
      console.error(
        "No se pudo obtener la descripción de la categoría:",
        error
      );
    }

    let navExtras: NavigationExtras = {
      queryParams: {
        code: order.code,
        boundPCatCode: order.boundPCatCode,
        boundPCatagoryDescription: boundPCatDesc, // <-- ¡LA LÍNEA AÑADIDA!
        OrderItem: JSON.stringify(order),
        IsEditOrder: true,
        IsHistoricalOrder: this.IsHistoicalOrder,
      },
    };

    if (!this.IsHistoicalOrder)
      this.router.navigate(["tabs/order/edit-order"], navExtras);
    else this.router.navigate(["tabs/orderhistory/edit-order"], navExtras);
  }

  ShowEditButtons() {
    if (!this.canShowEdit) this.canShowEdit = true;
    else this.canShowEdit = false;
  }

  async populateOrder() {
    var orderHistoryMasterId = 0;
    if (this.orderHistoryItem) {
      orderHistoryMasterId = this.orderHistoryItem.orderHistoryMasterId;
    }
    await this.orderService.getOrder(orderHistoryMasterId).then((x) => {
      this.arrOrder = x;
    });
  }

  async getHistoricalOrderDetailsFromRoute() {
    await this.activatedRoute.queryParams.subscribe((x) => {
      if (x.IsHistoicalOrder) {
        this.IsHistoicalOrder = Boolean(JSON.parse(x.IsHistoicalOrder));
        this.orderHistoryItem = JSON.parse(x["orderHistoryItem"]);
      }
    });
  }

  async deleteOrder(order: Order) {
    await this.orderService.deleteOrderItem(order.orderId);
    await this.populateOrder();
  }

  async onAmountChange(item: Order) {
    if (item.amount > 0 && Number.isInteger(+item.amount)) {
      await this.orderService.updateOrder(item);
      await this.populateOrder();
    } else {
      this.commonService.showErrorMessage(
        "Bitte geben Sie einen gültigen Betrag ein."
      );
    }
  }
}
