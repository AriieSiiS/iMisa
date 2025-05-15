import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx'
@Injectable({
  providedIn: 'root'
})
export class NativestorageService {

  constructor(private nativeStorege: NativeStorage) { }

  async setNativeValue(key: string, value: any) {
    await this.nativeStorege.setItem(key, value).then(() => {
    });
  }

  async getNativeValue(key: string) {
    let nativeValue;
    await this.nativeStorege.getItem(key).then((res) => {
      nativeValue = res;
    });
    return nativeValue;
  }
}
