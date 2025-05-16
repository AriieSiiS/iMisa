import { Injectable } from "@angular/core";
import { Accounts } from "../models/accounts";
import { NativestorageService } from "./nativestorage.service";

@Injectable({
  providedIn: "root",
})
export class AccountService {
  constructor(private nativestorageService: NativestorageService) {}

  async getAccounts(): Promise<Accounts[]> {
    const rawAccounts = await this.nativestorageService.getNativeValue(
      "accounts"
    );
      console.log("[AccountService] rawAccounts from storage:", rawAccounts); // <-- LOG CRÍTICO
    if (!rawAccounts) return [];

return rawAccounts.map((item: any) => {
  const account = new Accounts();
  account.code = item.Code;
  account.description = item.DescriptionShort; // <--- CORREGIDO
  return account;
});

  }

  populateAccountsFromDBObject(dbObj: any): Accounts {
    var account = new Accounts();
    account.code = dbObj.code;
    account.description = dbObj.description;

    return account;
  }
}
