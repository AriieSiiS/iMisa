import { Injectable } from '@angular/core';
import { DataAccessServiceService } from '../data-access/data-access-service.service';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
 
  constructor(private dataAccessServiceService: DataAccessServiceService) { }


  // getProducts(searchText: string): Product[] {
  //   let products: Product[];

  //   let pr = this.dataAccessServiceService.getProduct(searchText).then((r) => {
  //     if (r.rows.length > 0) {
  //       r.rows.item.forEach(x => {
  //         products.push(this.populateProductTypeFromDBObject(x));
  //       });
  //     }
  //   });
  //   return products;
  // }

  async getProducts(boundPCatCode:number){
    let products: Product[]=[];
      await this.dataAccessServiceService.getProduct(boundPCatCode).then((r) => {
      if (r.rows.length > 0) {
        for(var i=0;i<=r.rows.length-1;i++)
        {
          products.push(this.populateProductTypeFromDBObject(r.rows.item(i)));
        }
      }
    });
    return products;
  }

  async getProductById(boundPCatCode:number, productCode:number){
    let product: Product;
      await this.dataAccessServiceService.getProductById(boundPCatCode,productCode).then((r) => {
      if (r.rows.length > 0) {
        for(var i=0;i<=r.rows.length-1;i++)
        {
          product= this.populateProductTypeFromDBObject(r.rows.item(i));
          product.boundPCatagoryDescription =r.rows.item(i).boundPCatagoryDescription;
        }
      }
    });
    return product;
  }
  
  populateProductTypeFromDBObject(dbObj: any): Product {
    var prd = new Product()
    prd.boundPCatCode = dbObj.boundPCatCode;
      prd.code = dbObj.code;
      prd.defaultqty = dbObj.defaultqty;
      prd.descinternal = dbObj.descinternal;
      prd.factorqty = dbObj.factorqty;
      prd.maxqty = dbObj.maxqty;
      prd.minqty = dbObj.minqty;
      prd.mawiMatControl = dbObj.mawiMatControl;
      prd.mawiMatGroup = dbObj.mawiMatGroup;
    return prd;
  }
  
}
