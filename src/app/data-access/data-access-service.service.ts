import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Platform } from "@ionic/angular";
import { SQLiteObject, SQLite } from "@awesome-cordova-plugins/sqlite/ngx";
import { Order } from "../models/order";
import { CommonService } from "../imisa-services/common.service";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataAccessServiceService {
  private misaDB: SQLiteObject;

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    if (
      this.platform &&
      typeof this.platform.ready === "function" &&
      this.platform.is &&
      this.platform.is("cordova")
    ) {
      this.platform.ready().then(() => {
        // this.sqlite.deleteDatabase({name:"iMisa.db",location:"default"});

        this.sqlite
          .create({
            name: "iMisa5.db",
            location: "default",
          })
          .then((db: SQLiteObject) => {
            this.misaDB = db;

            db.executeSql(
              `create table if not exists BoundPCatCode(
          boundPCatCode INTEGER,
          descinternal NVARCHAR(300),
          sortOrder INTEGER
        )`,
              []
            );

            db.executeSql(
              `create table if not exists Products(
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
      )`,
              []
            );

            db.executeSql(
              `create table if not exists Orders(
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
        
      )`,
              []
            );
            // db.executeSql('delete from OrderHistoryDetails',[]);
            // db.executeSql('delete from OrderHistoryMaster',[]);

            db.executeSql(
              `create table if not exists OrderHistoryMaster(
        orderHistoryMasterId INTEGER PRIMARY KEY  AUTOINCREMENT,
        products integer,
        dateadded text       
      )`,
              []
            ).then(() => {
              db.executeSql(
                `create table if not exists OrderHistoryDetails(
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
                  )`,
                []
              );
            });

            db.executeSql(
              `create table if not exists Accounts(
          code text,
          description text       
        )`,
              []
            );

            db.executeSql(
              `create table if not exists Rights(
          key text,
          value text       
        )`,
              []
            );
          });

        // this.commonService.UpdateDefaultNativeSettings();
      });
    }
  }

  async insertProductData(arrProducts: any) {
    await this.misaDB.executeSql("delete from products", []);
    //this.misaDB.executeSql("delete from orders", []);
    let insertRows = [];

    arrProducts.forEach((item) => {
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
        [
          item[0],
          item[1],
          item[2],
          item[3],
          item[4],
          item[5],
          item[6],
          item[7],
          item[8],
          item[9],
        ],
      ]);
    });
    await this.misaDB
      .sqlBatch(insertRows)
      .then(async (result) => {
        console.info("Inserted Products");
      })
      .catch((e) => console.log(e));
  }

  async insertBoundPcatCodeData(arrBoundPcatCode: any) {
    this.misaDB.executeSql("delete from BoundPCatCode", []);

    let insertRows = [];
    arrBoundPcatCode.forEach((item) => {
      insertRows.push([
        `INSERT INTO BoundPCatCode (boundPCatCode ,
          descinternal ,
          sortOrder  ) VALUES (?, ?, ?)`,
        [item[0], item[1], item[2]],
      ]);
    });
    await this.misaDB
      .sqlBatch(insertRows)
      .then(async (result) => {
        console.info("Inserted Bound Pcat Code Data");
      })
      .catch((e) => console.log(e));
  }

  async insertAccountData(arrAccount: any) {
    await this.misaDB.executeSql("delete from Accounts", []);

    let insertRows = [];
    arrAccount.forEach((item) => {
      insertRows.push([
        `INSERT INTO Accounts (code ,
          description ) 
          VALUES (?, ?)`,
        [item[0], item[1]],
      ]);
    });
    await this.misaDB
      .sqlBatch(insertRows)
      .then(async (result) => {
        console.info("Inserted Account Data");
      })
      .catch((e) => console.log(e));
  }

  getProductById(): Promise<{ rows: any[] }> {
    return Promise.resolve({ rows: [] });
  }

  insertOrderData(order: Order) {
    //this.misaDB.executeSql("delete from products", []);
    this.commonService.getOrderAccountNumber().then((x) => {
      order.accountno = x;
    });
    let insertRows = [];
    var sql = `INSERT INTO Orders ( objectId ,
        boundPCatCode,
        code ,
        amount ,
        deliverydays ,
        additionaldesc ,
        fid ,
        accountno ,
        dateadded 
          ) VALUES (?, ?, ?, ?,?,?,?,?,?)`;
    let data = [
      order.objectId,
      order.boundPCatCode,
      order.code,
      order.amount,
      order.deliverydays,
      order.additionaldesc,
      order.fid,
      order.accountno,
      this.datePipe.transform(new Date(), "MM-dd-yyyy hh:mm:ss"),
    ];

    return this.misaDB.executeSql(sql, data);
  }

  updateOrder(order: Order) {
    let insertRows = [];
    var sql =
      "update Orders set  amount =" +
      order.amount.toString() +
      " ,additionaldesc='" +
      order.additionaldesc +
      "' where orderId=" +
      order.orderId;
    return this.misaDB.executeSql(sql, []);
  }

  async archiveOrder(arrOrder: Order[]) {
    let masterHistoryId: any;
    var sql = `INSERT INTO OrderHistoryMaster (products ,
      dateadded      
      ) VALUES (?, ?)`;
    let data = [
      arrOrder.length,
      this.datePipe.transform(new Date(), "MM-dd-yyyy hh:mm:ss"),
    ];

    var res = await this.misaDB.executeSql(sql, data);
    masterHistoryId = res.insertId;
    let insertRows = [];
    arrOrder.forEach((item) => {
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
        [
          item.orderId,
          item.objectId,
          item.boundPCatCode,
          item.code,
          item.amount,
          item.deliverydays,
          item.additionaldesc,
          item.fid,
          item.accountno,
          item.dateadded,
          masterHistoryId,
        ],
      ]);
    });

    await this.misaDB.sqlBatch(insertRows).then(async (result) => {
      console.info("Inserted order history");
    });

    await this.misaDB.executeSql("delete from Orders", []);
  }

  async deleteOrderItem(orderId: number) {
    let sql = "delete from Orders where orderId=" + orderId;
    await this.misaDB.executeSql(sql, []);
  }

  async getSeqValForTable(tableName: string) {
    let sql = "select seq from sqlite_sequence where name='" + tableName + "'";
    var id = 0;
    var res = await this.misaDB.executeSql(sql, []);
    return res.rows.item(0).seq;
  }

  getOrder(orderHistoryMasterId: number = 0): Promise<any> {
    return Promise.resolve({
      rows: {
        length: 0,
        item: (i: number) => null,
      },
    });
  }

  async getOrderHistory() {
    return Promise.resolve({
      rows: {
        length: 0,
        item: (i: number) => null,
      },
    });
  }

  async getOrderToSubmit(): Promise<any> {
    // Devuelve todos los pedidos pendientes en la tabla Orders
    const sql = `SELECT * FROM Orders`;
    const res = await this.misaDB.executeSql(sql, []);
    return res;
  }

  getOrderById(orderId: number = 0): Promise<any> {
    return Promise.resolve({
      rows: {
        length: 0,
        item: (i: number) => null,
      },
    });
  }
  /*  */
  submitOrder(orderDtls: string[]) {}

  async getProductsRest(): Promise<any[]> {
    console.log("[DataAccess] 📞 Pidiendo 'products'...");
    const deviceId = await this.commonService.getDeviceId();
    const serverUrl = await this.commonService.getServerUrl();
    const user = await this.commonService.getRestUser();
    const pass = await this.commonService.getRestPassword();
    const url = `${serverUrl}/api/iMisa?type=products&DeviceID=${deviceId}`;
    const headers = new HttpHeaders({
      Authorization: "Basic " + btoa(`${user}:${pass}`),
    });
    const response = await lastValueFrom(
      this.http.get<any[]>(url, { headers })
    );
    console.log(`[DataAccess] ✅ OK: Recibidos ${response.length} productos.`);
    return response;
  }

  async getBoundPcatCodeRest(): Promise<any[]> {
    console.log("[DataAccess] 📞 Pidiendo 'boundpcatcode'...");
    const deviceId = await this.commonService.getDeviceId();
    const serverUrl = await this.commonService.getServerUrl();
    const user = await this.commonService.getRestUser();
    const pass = await this.commonService.getRestPassword();
    const url = `${serverUrl}/api/iMisa?type=boundpcatcode&DeviceID=${deviceId}`;
    const headers = new HttpHeaders({
      Authorization: "Basic " + btoa(`${user}:${pass}`),
    });
    const response = await lastValueFrom(
      this.http.get<any[]>(url, { headers })
    );
    console.log(
      `[DataAccess] ✅ OK: Recibidos ${response.length} boundpcatcodes.`
    );
    return response;
  }

  async getMawiMatGroupRest(): Promise<any[]> {
    console.log("[DataAccess] 📞 Pidiendo 'mawimatgroup'...");
    const deviceId = await this.commonService.getDeviceId();
    const serverUrl = await this.commonService.getServerUrl();
    const user = await this.commonService.getRestUser();
    const pass = await this.commonService.getRestPassword();
    const url = `${serverUrl}/api/iMisa?type=mawimatgroup&DeviceID=${deviceId}`;
    const headers = new HttpHeaders({
      Authorization: "Basic " + btoa(`${user}:${pass}`),
    });
    const response = await lastValueFrom(
      this.http.get<any[]>(url, { headers })
    );
    console.log(
      `[DataAccess] ✅ OK: Recibidos ${response.length} mawimatgroups.`
    );
    return response;
  }

  async getAccountsRest(): Promise<any[]> {
    console.log("[DataAccess] 📞 Pidiendo 'accounts'...");
    try {
      const deviceId = await this.commonService.getDeviceId();
      const serverUrl = await this.commonService.getServerUrl();
      const user = await this.commonService.getRestUser();
      const pass = await this.commonService.getRestPassword();
      const url = `${serverUrl}/api/iMisa?type=accounts&DeviceID=${deviceId}`;
      const headers = new HttpHeaders({
        Authorization: "Basic " + btoa(`${user}:${pass}`),
      });
      const response = await lastValueFrom(
        this.http.get<any[]>(url, { headers })
      );
      console.log(`[DataAccess] ✅ OK: Recibidas ${response.length} cuentas.`);
      return response;
    } catch (error) {
      console.error(
        "[DataAccess] ❌ ERROR al pedir 'accounts':",
        error.message
      );
      return [];
    }
  }

  async getRightsRest(): Promise<any> {
    console.log("[DataAccess] 📞 Pidiendo 'rights'...");
    try {
      const deviceId = await this.commonService.getDeviceId();
      const serverUrl = await this.commonService.getServerUrl();
      const user = await this.commonService.getRestUser();
      const pass = await this.commonService.getRestPassword();
      const url = `${serverUrl}/api/iMisa?type=rights&DeviceID=${deviceId}`;
      const headers = new HttpHeaders({
        Authorization: "Basic " + btoa(`${user}:${pass}`),
      });
      const response = await lastValueFrom(
        this.http.get<any>(url, { headers })
      );
      console.log("[DataAccess] ✅ OK: Recibidos los permisos (rights).");
      return response;
    } catch (error) {
      console.error("[DataAccess] ❌ ERROR al pedir 'rights':", error.message);
      return null;
    }
  }

  async postOrderToApi(
    boundPcatCode: string,
    accountNumber: string,
    userInitial: string,
    orderLines: Array<{
      ProductCode: string;
      Description: string;
      Quantity: number;
      MatGroup: string;
    }>
  ): Promise<any> {
    const deviceId = await this.commonService.getDeviceId();
    const serverUrl = await this.commonService.getServerUrl();
    const url = `${serverUrl}/api/iMisa`;

    const body = {
      DeviceID: deviceId,
      BoundPcatCode: boundPcatCode,
      Date: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
      AccountNumber: accountNumber,
      OrderLines: orderLines,
      UserInitial: userInitial,
    };

    const headers = new HttpHeaders({
      Authorization: "Basic " + btoa("psc:psc"),
      "Content-Type": "application/json",
    });
    return lastValueFrom(
      this.http.post(url, body, { headers, responseType: "text" as "json" })
    );
  }
}
