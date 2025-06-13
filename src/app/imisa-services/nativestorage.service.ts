import { Injectable } from "@angular/core";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";

@Injectable({
  providedIn: "root",
})
export class NativestorageService {
  constructor(private nativeStorege: NativeStorage) {}

  async setNativeValue(key: string, value: any) {
    await this.nativeStorege.setItem(key, value);
  }

  async getNativeValue(key: string) {
    let nativeValue;
    try {
      nativeValue = await this.nativeStorege.getItem(key);
    } catch (err) {
      if (err && err.code === 2) {
        return null;
      }
      throw err;
    }
    return nativeValue;
  }

  async hasAllDataSaved(): Promise<boolean> {
    const keys = [
      "products",
      "boundpcatcode",
      "accounts",
      "rights",
      "mawimatgroup",
    ];

    for (let key of keys) {
      const data = await this.getNativeValue(key);
      let isValid = true;

      if (!data) {
        isValid = false;
      } else if (Array.isArray(data) && data.length === 0) {
        // Allow 'accounts' to be an empty array for now for debugging
        if (key !== "accounts") {
          isValid = false;
        }
      } else if (
        typeof data === "object" &&
        !Array.isArray(data) &&
        Object.keys(data).length === 0
      ) {
        isValid = false;
      }

      if (!isValid) {
        return false;
      }
    }
    return true;
  }
}
