import { Injectable } from "@angular/core";
import { Product } from "../models/product";
import { NativestorageService } from "./nativestorage.service";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  constructor(private nativestorageService: NativestorageService) {}

  async getProducts(boundPCatCode: number): Promise<Product[]> {
    const productsRaw: any[] = await this.nativestorageService.getNativeValue(
      "products"
    );
    if (!productsRaw) return [];

    const products: Product[] = productsRaw
      .map((item: any) => {
        const p = new Product();
        p.boundPCatCode = Number(item.BoundPCatCode);
        p.descinternal = item.DescInternalGe;
        p.code = Number(item.Code);
        p.searchcode = item.SearchCode;
        p.mawiMatGroup = Number(item.MatGroup);
        p.mawiMatControl = Number(item.MatControl);
        p.defaultqty = Number(item.OrdStdQty);
        p.minqty = Number(item.OrdQtyMin);
        p.maxqty = Number(item.OrdQtyMax);
        p.factorqty = Number(item.OrdQtyFactor);
        p.boundPCatagoryDescription = "";
        return p;
      })
      .filter((p: Product) => p.boundPCatCode === boundPCatCode);

    return products;
  }

  async getProductById(
    boundPCatCode: number,
    productCode: number
  ): Promise<Product | null> {
    const products = await this.getProducts(boundPCatCode);
    const found = products.find((p) => Number(p.code) === Number(productCode));
    return found ?? null;
  }
}
