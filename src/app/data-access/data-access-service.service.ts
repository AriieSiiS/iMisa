import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Platform } from '@ionic/angular';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite/ngx';
import { Order } from '../models/order';
import { promise } from 'protractor';
import { CommonService } from '../imisa-services/common.service';


@Injectable({
  providedIn: 'root'
})
export class DataAccessServiceService {
  private misaDB: SQLiteObject;

  constructor(private platform: Platform,
    private sqlite: SQLite, private datePipe: DatePipe,
    private commonService: CommonService) {
    this.platform.ready().then(() => {

      // this.sqlite.deleteDatabase({name:"iMisa.db",location:"default"});


      this.sqlite.create({
        name: 'iMisa5.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.misaDB = db;

        db.executeSql(`create table if not exists BoundPCatCode(
          boundPCatCode INTEGER,
          descinternal NVARCHAR(300),
          sortOrder INTEGER
        )`, []);


        db.executeSql(`create table if not exists Products(
        boundPCatCode INTEGER,
        descinternal NVARCHAR(300),
        code INTEGER,
        searchcode NVARCHAR(300),
        mawiMatGroup INTEGER,
        mawiMatControl INTEGER,
        defaultqty INTEGER,
        minqty INTEGER,
        maxqty INTEGER,
        factorqty INTEGER
      )`, []);

        db.executeSql(`create table if not exists Orders(
        orderId INTEGER PRIMARY KEY  AUTOINCREMENT,
        objectId NVARCHAR(300),
        boundPCatCode INTEGER,
        code INTEGER,
        amount INTEGER,
        deliverydays INTEGER,
        additionaldesc NVARCHAR(500),
        fid INTEGER,
        accountno INTEGER,
        dateadded text
        
      )`, []);
      // db.executeSql('delete from OrderHistoryDetails',[]);
      // db.executeSql('delete from OrderHistoryMaster',[]);

        db.executeSql(`create table if not exists OrderHistoryMaster(
        orderHistoryMasterId INTEGER PRIMARY KEY  AUTOINCREMENT,
        products integer,
        dateadded text       
      )`, []).then(() => {


          db.executeSql(`create table if not exists OrderHistoryDetails(
        orderHistoryId INTEGER PRIMARY KEY  AUTOINCREMENT,
        orderHistoryMasterId INTEGER, 
        orderId INTEGER,
        objectId NVARCHAR(300),
        boundPCatCode INTEGER,
        code INTEGER,
        amount INTEGER,
        deliverydays INTEGER,
        additionaldesc NVARCHAR(500),
        fid INTEGER,
        accountno INTEGER,
        dateadded text
                  )`, []);
        });

        db.executeSql(`create table if not exists Accounts(
          code text,
          description text       
        )`, []);

        db.executeSql(`create table if not exists Rights(
          key text,
          value text       
        )`, []);

      });


     // this.commonService.UpdateDefaultNativeSettings();
    });
  }

  async insertProductData(arrProducts: any) {
    await this.misaDB.executeSql("delete from products", []);
    //this.misaDB.executeSql("delete from orders", []);
    let insertRows = [];


    arrProducts.forEach(item => {
      insertRows.push([
        `INSERT INTO products (boundPCatCode,
              descinternal,
              code ,
              searchcode ,
              mawiMatGroup ,
              mawiMatControl ,
              defaultqty ,
              minqty ,
              maxqty ,
              factorqty ) VALUES (?, ?, ?, ?,?,?,?,?,?,?)`,
        [item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8], item[9]]
      ]);
    });
    await this.misaDB.sqlBatch(insertRows).then(async (result) => {
      console.info("Inserted Products");
    }).catch(e => console.log(e));
  }

  async insertBoundPcatCodeData(arrBoundPcatCode: any) {
    this.misaDB.executeSql("delete from BoundPCatCode", []);

    let insertRows = [];
    arrBoundPcatCode.forEach(item => {
      insertRows.push([
        `INSERT INTO BoundPCatCode (boundPCatCode ,
          descinternal ,
          sortOrder  ) VALUES (?, ?, ?)`,
        [item[0], item[1], item[2]]
      ]);
    });
    await this.misaDB.sqlBatch(insertRows).then(async (result) => {
      console.info("Inserted Bound Pcat Code Data");
    }).catch(e => console.log(e));
  }

  async insertAccountData(arrAccount: any) {
    await this.misaDB.executeSql("delete from Accounts", []);

    let insertRows = [];
    arrAccount.forEach(item => {
      insertRows.push([
        `INSERT INTO Accounts (code ,
          description ) 
          VALUES (?, ?)`,
        [item[0], item[1]]
      ]);
    });
    await this.misaDB.sqlBatch(insertRows).then(async (result) => {
      console.info("Inserted Account Data");
    }).catch(e => console.log(e));
  }

  getProduct(boundPCatCode: number): any {

    let sql = "select * from products where boundPCatCode = " + boundPCatCode
    // if(searchTxt !='')
    //   sql+= "  AND  descinternal like '%" + searchTxt + "'"

    return this.misaDB.executeSql(sql, [])
  }

  getProductById(boundPCatCode: number, productCode: number): any {

    let sql = `select p.*, cat.descinternal as boundPCatagoryDescription  from products as p 
    left join BoundPCatCode cat on p.boundPCatCode=cat.boundPCatCode
    where p.boundPCatCode = ` + boundPCatCode + " and p.code =" + productCode;
    return this.misaDB.executeSql(sql, [])
  }



  getArticals(): any {
    return this.misaDB.executeSql("select * from BoundPCatCode", []);
  }


  insertOrderData(order: Order) {
    //this.misaDB.executeSql("delete from products", []);
    this.commonService.getOrderAccountNumber().then(x => {
      order.accountno = x
    })
    let insertRows = [];
    var sql =
      `INSERT INTO Orders ( objectId ,
        boundPCatCode,
        code ,
        amount ,
        deliverydays ,
        additionaldesc ,
        fid ,
        accountno ,
        dateadded 
          ) VALUES (?, ?, ?, ?,?,?,?,?,?)`;
    let data = [order.objectId, order.boundPCatCode, order.code, order.amount,
    order.deliverydays, order.additionaldesc, order.fid, order.accountno,
    this.datePipe.transform(new Date, "MM-dd-yyyy hh:mm:ss")];

    return this.misaDB.executeSql(sql, data);
  }

  updateOrder(order: Order) {
    let insertRows = [];
    var sql =
      "update Orders set  amount =" + order.amount.toString() + " ,additionaldesc='" + order.additionaldesc + "' where orderId=" + order.orderId;
    return this.misaDB.executeSql(sql, []);
  }

  async archiveOrder(arrOrder: Order[]) {

    let masterHistoryId: any;
    var sql =
      `INSERT INTO OrderHistoryMaster (products ,
      dateadded      
      ) VALUES (?, ?)`;
    let data = [arrOrder.length,
    this.datePipe.transform(new Date, "MM-dd-yyyy hh:mm:ss")];

    var res = await this.misaDB.executeSql(sql, data)
    masterHistoryId = res.insertId;
    let insertRows = [];
    arrOrder.forEach(item => {
      insertRows.push([
        `INSERT INTO OrderHistoryDetails (
                orderId,
                objectId ,
                boundPCatCode,
                code ,
                amount ,
                deliverydays ,
                additionaldesc ,
                fid ,
                accountno ,
                dateadded, 
                orderHistoryMasterId
                  ) VALUES (?, ?, ?, ?,?,?,?,?,?,?,?)`,
        [item.orderId, item.objectId, item.boundPCatCode, item.code, item.amount, item.deliverydays,
        item.additionaldesc, item.fid, item.accountno, item.dateadded, masterHistoryId]
      ]);
    });

    await this.misaDB.sqlBatch(insertRows).then(async (result) => {
      console.info("Inserted order history");
    });
   
    await this.misaDB.executeSql("delete from Orders", [])
  }

  async deleteOrderItem(orderId:number)
  {
    let sql= "delete from Orders where orderId="  + orderId
    await this.misaDB.executeSql(sql, []);
  }

  async getSeqValForTable(tableName: string) {
    let sql = "select seq from sqlite_sequence where name='" + tableName + "'";
    var id = 0;
    var res = await this.misaDB.executeSql(sql, [])
    return res.rows.item(0).seq;
  }

  getOrder(orderHistoryMasterId:number=0): any {
    
    let sql='';
    if(orderHistoryMasterId==0)
    {
     sql = `select O.*, P.descinternal as productDescription 
     from Orders O  join Products P ON P.code=O.code and p.boundPCatCode=O.boundPCatCode`
    }
    else
    {
      sql = `select OHD.*, P.descinternal as productDescription 
      from OrderHistoryDetails OHD  join Products P 
      ON P.code=OHD.code and p.boundPCatCode=OHD.boundPCatCode where OHD.orderHistoryMasterId=` +orderHistoryMasterId

      // sql = `select OHD.*
      // from OrderHistoryDetails OHD where OHD.orderHistoryMasterId=` +orderHistoryMasterId
     //await this.misaDB.executeSql(sql, [])

    }

    // where orderHistoryId =`  +orderHistoryId;
    // let sql = `select O.*
    // from Orders O
    //      where orderHistoryId =`  +orderHistoryId;
    return this.misaDB.executeSql(sql, []);
  }

 async getOrderHistory() {
   var aa =this.commonService.CURRNET_BOUND_PCAT_CODE;
    let sql = `select * from OrderHistoryMaster`  ;
    return await this.misaDB.executeSql(sql, []);
  }

  getOrderToSubmit(): Promise<any> {
    let sql = `select O.*
     from Orders O `
    return this.misaDB.executeSql(sql, []);
  }

  getOrderById(orderId: number = 0): any {
    let sql = "select * from Orders where orderId = " + orderId;
    return this.misaDB.executeSql(sql, [])
  }

  submitOrder(orderDtls: string[]) {



  }

  async getAccounts()  {
    let sql = "select * from Accounts";
    return await this.misaDB.executeSql(sql, [])
  }

}
