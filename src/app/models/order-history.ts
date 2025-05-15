import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderHistory {
  orderHistoryMasterId:number;
  products :number;
  dateadded :Date 
  constructor() { }
}
