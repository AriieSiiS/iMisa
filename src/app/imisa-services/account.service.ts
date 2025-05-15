import { Injectable } from '@angular/core';
import { Accounts } from '../models/accounts';
import { DataAccessServiceService } from '../data-access/data-access-service.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private dataAccessService:DataAccessServiceService)
   { 

   }

 

  async getAccounts() {
    let arrAccounts: Accounts[] = [];
    await this.dataAccessService.getAccounts().then((r) => {
      if (r.rows.length > 0) {
        for(var i=0;i<=r.rows.length-1;i++)
        {
          arrAccounts.push(this.populateAccountsFromDBObject(r.rows.item(i)));
        }
      }
    });
    return arrAccounts;
  }

  populateAccountsFromDBObject(dbObj: any): Accounts {
    var account = new Accounts()
    account.code = dbObj.code;
    account.description  = dbObj.description;
   
    return account;
  }
}
