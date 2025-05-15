import { Injectable } from '@angular/core';
import { DataAccessServiceService } from '../data-access/data-access-service.service';
import { BoundPcatCode } from '../models/bound-pcat-code';


@Injectable({
  providedIn: 'root'
})
export class BoundPcatService {

  constructor(private dataAccessServiceService: DataAccessServiceService) { }
  
   async getArticals(){
    let boundPcatCodes: BoundPcatCode[]=[];
      await this.dataAccessServiceService.getArticals().then((r) => {
     
      if (r.rows.length > 0) {

        for(var i=0;i<=r.rows.length-1;i++)
        {
          boundPcatCodes.push(this.populateBoundPcatCodeFromDBObject(r.rows.item(i)));
        }
        // r.rows.item.forEach(x => {
        //   boundPcatCodes.push(this.populateBoundPcatCodeFromDBObject(x));
        // });
      }
      
    });
    return boundPcatCodes;
  }

  populateBoundPcatCodeFromDBObject(dbObj: any): BoundPcatCode {
    var boundPcatCode = new BoundPcatCode()
      boundPcatCode.boundPCatCode = dbObj.boundPCatCode,
      boundPcatCode.sortOrder = dbObj.sortOrder,
      boundPcatCode.descinternal = dbObj.descinternal

    return boundPcatCode;
  }
}
