import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Product } from "../../models/product";
import { Order } from "../../models/order";
import { OrderService } from "../../imisa-services/order.service";
import { CommonService } from "../../imisa-services/common.service";
import { ProductService } from "../../imisa-services/product.service";

@Component({
  selector: "app-item-edit",
  templateUrl: "./item-edit.page.html",
  styleUrls: ["./item-edit.page.scss"],
  standalone: false,
})
export class ItemEditPage implements OnInit {
  artical: Product = new Product();
  order: Order = new Order();
  orderQty: number = 0;
  additionalDescription: string = "";
  IsEditOrder: boolean;
  IsHistoricalOrder: boolean = false;
  defaultBackLink = "/tabs/articals";
  errorMessage: string = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private commonService: CommonService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.commonService.currentPresentedPage = "artilcals";
    this.getArticaDetailsFromRoute();
  }

  getArticaDetailsFromRoute() {
    this.activatedRoute.queryParams.subscribe((x) => {
      console.log("[ItemEditPage] Parámetros query:", x);
      const code = Number(x["code"]);
      const boundPCatCode = Number(x["boundPCatCode"]);
      const boundPCatagoryDescription = x["boundPCatagoryDescription"];
      console.log(
        "[ItemEditPage] code:",
        code,
        "boundPCatCode:",
        boundPCatCode,
        "boundPCatagoryDescription:",
        boundPCatagoryDescription
      );
      try {
        this.IsEditOrder = Boolean(JSON.parse(x.IsEditOrder));
      } catch {
        this.IsEditOrder = false;
      }

      if (!isNaN(code) && !isNaN(boundPCatCode)) {
        this.productService
          .getProducts(boundPCatCode)
          .then((products: Product[]) => {
            console.log(
              "[ItemEditPage] Productos obtenidos para boundPCatCode",
              boundPCatCode,
              ":",
              products
            );
            this.artical = products.find((p: Product) => p.code === code);
            console.log("[ItemEditPage] Producto encontrado:", this.artical);
            if (!this.artical) {
              this.commonService.showAlertMessage(
                "Produkt nicht gefunden",
                "iMisa"
              );
              this.artical = new Product();
              this.orderQty = 0;
            } else {
              if (boundPCatagoryDescription && this.artical) {
                this.artical.boundPCatagoryDescription =
                  boundPCatagoryDescription;
              }
              if (!this.IsEditOrder) {
                this.orderQty = this.artical.minqty;
              }
            }

            if (this.IsEditOrder === true && x.OrderItem) {
              this.order = JSON.parse(x.OrderItem);
              this.additionalDescription = this.order.additionaldesc;
              this.orderQty = this.order.amount;
            }
          });
      }

      try {
        this.IsHistoricalOrder = Boolean(JSON.parse(x.IsHistoricalOrder));
      } catch {
        this.IsHistoricalOrder = false;
      }
    });
  }

  async saveOrder() {
    if (
      this.orderQty >= this.artical.minqty &&
      this.orderQty <= this.artical.maxqty
    ) {
      if (this.IsEditOrder === false) {
        let order = new Order();
        order.boundPCatCode = this.artical.boundPCatCode; 
        order.productDescription = this.artical.descinternal; 
        order.code = this.artical.code;
        let orderAccountNo = await this.commonService.getOrderAccountNumber();
        order.accountno = orderAccountNo ? orderAccountNo.toString() : "250";
        order.additionaldesc = this.additionalDescription;
        order.amount = this.orderQty;
        order.deliverydays = 0; // TODO: ajustar si procede
        order.fid = 0;
        order.objectId = "MisaOrder";
        await this.orderService.addOrder(order).then(() => {
          this.commonService.showMessage("Bestellung erfolgreich gespeichert!");
          this.router.navigate(["tabs/articals/artical-list"]);
        });
      } else {
        // Editar pedido existente
        this.order.amount = this.orderQty;
        this.order.additionaldesc = this.additionalDescription;
        await this.orderService.updateOrder(this.order).then(() => {
          this.commonService.showMessage("Bestellung erfolgreich gespeichert!");
          this.router.navigate(["tabs/order"]);
        });
      }
    } else {
      await this.commonService.showAlertMessage(
        "Die Bestellmenge sollte größer als die Mindestbestellmenge und kleiner als die maximale Bestellmenge sein. Bitte ändern Sie die Menge entsprechend.",
        "iMisa"
      );
    }
  }

  async validateQuantity(event) {
    this.errorMessage = "";
    let qty = Number(event.detail.value);
    const min = this.artical.minqty;
    const max = this.artical.maxqty;
    const factor = this.artical.factorqty;

    if (qty < min) qty = min;
    if (qty > max) qty = max;

    if (factor > 1) {
      const remainder = (qty - min) % factor;
      if (remainder !== 0) {
        qty = min + Math.ceil((qty - min) / factor) * factor;
        if (qty > max) qty = max;
      }
    }

    this.orderQty = qty;

    if (qty !== Number(event.detail.value)) {
      this.errorMessage =
        "Die Menge muss ein Vielfaches des Faktors (" +
        factor +
        ") sein. Angepasst auf " +
        qty +
        ".";
    }
  }
}
