import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Order {
  orderId:number;
  objectId:string;
  boundPCatCode:number;
  code: number;
  amount: number;
  deliverydays: number;
  additionaldesc: string;
  fid: number;
  accountno: string;
  dateadded: Date;
  productDescription:string;

  constructor() { }
}
