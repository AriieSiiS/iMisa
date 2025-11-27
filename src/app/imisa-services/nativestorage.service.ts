import { Injectable } from "@angular/core";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";

@Injectable({
  providedIn: "root",
})
export class NativestorageService {
  constructor(private nativeStorege: NativeStorage) {}

  async setNativeValue(key: string, value: any) {
    // Protección: NO sobrescribir datos existentes con valores vacíos o inválidos
    if (value === null || value === undefined) {
      console.warn(`[Storage] Intento de guardar valor null/undefined en key "${key}". Se mantienen datos anteriores.`);
      return;
    }

    // Protección: NO sobrescribir con arrays vacíos (excepto para "accounts" que puede estar vacío)
    if (Array.isArray(value) && value.length === 0 && key !== "accounts") {
      console.warn(`[Storage] Intento de guardar array vacío en key "${key}". Se mantienen datos anteriores.`);
      return;
    }

    // Si el valor es válido, guardar
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
    // Solo validar los datos REALMENTE necesarios para materialbeschaffung
    // Otros datos (accounts, rights, mawimatgroup) son opcionales y se descargan en background
    const keys = [
      "products",      // Usado por ProductService, artical-list, warenausgang
      "boundpcatcode"  // Usado por BoundPcatService, categorías
    ];

    for (let key of keys) {
      const data = await this.getNativeValue(key);
      let isValid = true;

      if (!data) {
        isValid = false;
      } else if (Array.isArray(data) && data.length === 0) {
        isValid = false;
      } else if (
        typeof data === "object" &&
        !Array.isArray(data) &&
        Object.keys(data).length === 0
      ) {
        isValid = false;
      }

      if (!isValid) {
        console.warn(`[Storage] Validación falló para key "${key}"`);
        return false;
      }
    }
    return true;
  }
}
