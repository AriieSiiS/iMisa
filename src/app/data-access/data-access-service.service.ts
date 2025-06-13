import { Injectable } from "@angular/core";
import { CommonService } from "../imisa-services/common.service";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataAccessServiceService {
  constructor(private commonService: CommonService, private http: HttpClient) {}

  getProductById(): Promise<{ rows: any[] }> {
    return Promise.resolve({ rows: [] });
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
    return response;
  }

  async getBoundPcatCodeRest(): Promise<any[]> {
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
    return response;
  }

  async getMawiMatGroupRest(): Promise<any[]> {
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
    return response;
  }

  async getAccountsRest(): Promise<any[]> {
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
      return response;
    } catch (error) {
      return [];
    }
  }

  async getRightsRest(): Promise<any> {
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
      return response;
    } catch (error) {
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
