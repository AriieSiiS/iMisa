import { Injectable } from '@angular/core';
import { Order } from './order';

@Injectable({
  providedIn: 'root'
})
export class OrderHistory {
  orderHistoryMasterId:number;
  products: Order[]; // 
  dateadded :Date 
  constructor() { }
}
