import { Injectable } from '@angular/core';
import { CommonService } from '../imisa-services/common.service';
import { DataAccessServiceService } from '../data-access/data-access-service.service';

@Injectable({
  providedIn: 'root'
})
export class Product {
  boundPCatCode:number;
  descinternal:string;
  code:number ;
  searchcode:number ;
  mawiMatGroup :number ;
  mawiMatControl :number ;
  defaultqty:number ;
  minqty:number ;
  maxqty:number ;
  factorqty:number ;
  boundPCatagoryDescription:string;
}


