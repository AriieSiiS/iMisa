import { Injectable } from "@angular/core";
import { BoundPcatCode } from "../models/bound-pcat-code";
import { NativestorageService } from "./nativestorage.service";

@Injectable({
  providedIn: "root",
})
export class BoundPcatService {
  constructor(private nativestorageService: NativestorageService) {}

  async getArticals(): Promise<BoundPcatCode[]> {
    const rawCats = await this.nativestorageService.getNativeValue(
      "boundpcatcode"
    );
    if (!rawCats) return [];

    return rawCats.map((item: any) => {
      const cat = new BoundPcatCode();
      cat.boundPCatCode = item.BoundToCode;
      cat.descinternal = item.BoundtoCodeDesc;
      cat.sortOrder = item.Rank;
      return cat;
    });
  }
}
