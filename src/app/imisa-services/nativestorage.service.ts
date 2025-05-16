import { Injectable } from "@angular/core";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";

@Injectable({
  providedIn: "root",
})
export class NativestorageService {
  constructor(private nativeStorege: NativeStorage) {}

  async setNativeValue(key: string, value: any) {
    // Log más descriptivo y menos verboso
    if (Array.isArray(value)) {
      console.log(
        `[NativeStorage] 💾 SET '${key}': Guardando Array de ${value.length} elementos.`
      );
    } else if (value && typeof value === "object") {
      console.log(`[NativeStorage] 💾 SET '${key}': Guardando Objeto.`);
    } else {
      console.log(
        `[NativeStorage] 💾 SET '${key}': Guardando valor simple:`,
        value
      );
    }
    await this.nativeStorege.setItem(key, value);
  }

  async getNativeValue(key: string) {
    let nativeValue;
    try {
      nativeValue = await this.nativeStorege.getItem(key);
      // Log más descriptivo y menos verboso
      if (Array.isArray(nativeValue)) {
        console.log(
          `[NativeStorage] 📖 GET '${key}': Leído Array de ${nativeValue.length} elementos.`
        );
      } else if (nativeValue && typeof nativeValue === "object") {
        console.log(`[NativeStorage] 📖 GET '${key}': Leído Objeto.`);
      } else {
        console.log(
          `[NativeStorage] 📖 GET '${key}': Leído valor simple:`,
          nativeValue
        );
      }
    } catch (err) {
      if (err && err.code === 2) {
        console.log(
          `[NativeStorage] ❔ GET '${key}': No encontrado (es normal si es la primera vez).`
        );
        return null;
      }
      throw err;
    }
    return nativeValue;
  }

  async hasAllDataSaved(): Promise<boolean> {
    console.log(
      "[NativeStorage] 🧐 Verificando si todos los datos están guardados..."
    );
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
        // Permitimos que 'accounts' sea un array vacío por ahora para depurar
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
        console.log(
          `[NativeStorage] ❌ CHECK FALLIDO para la clave '${key}'. Los datos faltan o están vacíos.`
        );
        return false;
      }
    }

    console.log(
      "[NativeStorage] ✅ CHECK OK: Todos los datos necesarios están presentes."
    );
    return true;
  }
}
