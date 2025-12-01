import { Injectable } from "@angular/core";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";

@Injectable({
  providedIn: "root",
})
export class NativestorageService {
  constructor(private nativeStorege: NativeStorage) {}

  async setNativeValue(key: string, value: any) {
    // Protección: NO sobrescribir datos existentes con valores vacíos o inválidos
    // PERO: permitir sobrescritura si NO existen datos previos (primera descarga)

    if (value === null || value === undefined) {
      console.warn(`[Storage] Intento de guardar valor null/undefined en key "${key}". Se mantienen datos anteriores.`);
      return;
    }

    // Para arrays vacíos (excepto accounts), verificar si hay datos previos
    if (Array.isArray(value) && value.length === 0 && key !== "accounts") {
      try {
        const existingData = await this.getNativeValue(key);
        if (existingData && Array.isArray(existingData) && existingData.length > 0) {
          console.warn(`[Storage] Intento de sobrescribir ${existingData.length} items con array vacío en key "${key}". Se mantienen datos anteriores.`);
          return;
        }
        // Si no hay datos previos, permitir guardar array vacío (puede ser legítimo)
        console.warn(`[Storage] Guardando array vacío en key "${key}" (no hay datos previos).`);
      } catch (err) {
        // Si falla leer datos previos, permitir guardar
        console.log(`[Storage] No se pudieron leer datos previos de "${key}", guardando array vacío.`);
      }
    }

    // Para objetos vacíos, verificar si hay datos previos
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
      try {
        const existingData = await this.getNativeValue(key);
        if (existingData && typeof existingData === "object" && Object.keys(existingData).length > 0) {
          console.warn(`[Storage] Intento de sobrescribir objeto con ${Object.keys(existingData).length} propiedades con objeto vacío en key "${key}". Se mantienen datos anteriores.`);
          return;
        }
        console.warn(`[Storage] Guardando objeto vacío en key "${key}" (no hay datos previos).`);
      } catch (err) {
        console.log(`[Storage] No se pudieron leer datos previos de "${key}", guardando objeto vacío.`);
      }
    }

    // Log para debugging
    console.log(`[Storage] Guardando ${Array.isArray(value) ? value.length + ' items' : typeof value} en key "${key}"`);

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
