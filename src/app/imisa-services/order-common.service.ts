import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
import { OrderService } from "./order.service";
import { ProductService } from "./product.service";
import { Product } from "../models/product";
import { Order } from "../models/order";

@Injectable({
  providedIn: "root",
})
export class OrderCommonService {
  constructor(
    private commonService: CommonService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  async addArticalInOrder(artical: Product) {
    let order = new Order();
    order.code = artical.code;
    order.boundPCatCode = artical.boundPCatCode;
    order.amount = artical.defaultqty;
    order.deliverydays = 0;
    order.fid = 0;
    order.objectId = "MisaOrder";
    order.productDescription = artical.descinternal;
    await this.orderService.addOrder(order).then(() => {
      this.commonService.showMessage("Order saved successfully !");
    });
  }

  async addOrder(barcode) {
    let result = false;
    console.log(barcode);
    if (this.commonService.CURRNET_BOUND_PCAT_CODE < 0) {
      await this.commonService.showAlertMessage(
        "Please select artical before scanning item",
        "iMisa"
      );
    } else {
      var boundPCatCode = this.commonService.CURRNET_BOUND_PCAT_CODE;
      let product: Product;
      await this.productService
        .getProductById(boundPCatCode, barcode)
        .then(async (res) => {
          product = res;
          if (typeof product !== typeof undefined) {
            await this.addArticalInOrder(product);
            result = true;
          } else {
            this.commonService.showAlertMessage(
              "Scanned product not found",
              "iMisa"
            );
            result = false;
          }
        });
    }
    return result;
  }
}
