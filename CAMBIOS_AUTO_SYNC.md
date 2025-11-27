# Cambios de Auto-Sincronización Condicional - iMisa

**Fecha:** 2025-11-27
**Objetivo:** Solucionar el problema de borrado de datos cuando la re-descarga falla

---

## Problema Original

La aplicación **borraba datos existentes** cada vez que se enviaba un pedido porque:

1. Ejecutaba `fetchAndSaveAllFiles()` automáticamente después de cada pedido
2. Si la API fallaba (timeout, red), sobrescribía datos con `null` o arrays vacíos
3. Bloqueaba acceso a materialbeschaffung porque `hasAllDataSaved()` retornaba `false`
4. No había manejo de errores ni protección de datos anteriores

---

## Solución Implementada: Opción 2 (Re-descarga Condicional)

### 1. Protección de Datos en Storage
**Archivo:** `src/app/imisa-services/nativestorage.service.ts`
**Líneas:** 10-24

**Cambio:**
- `setNativeValue()` ahora **NO sobrescribe** si el valor es `null`, `undefined` o array vacío
- Muestra warning en consola cuando intenta guardar datos inválidos
- **Mantiene datos anteriores** cuando hay un fallo de descarga

```typescript
async setNativeValue(key: string, value: any) {
  // Protección: NO sobrescribir datos existentes con valores vacíos
  if (value === null || value === undefined) {
    console.warn(`[Storage] Intento de guardar valor null/undefined en key "${key}"`);
    return; // Mantiene datos anteriores
  }

  if (Array.isArray(value) && value.length === 0 && key !== "accounts") {
    console.warn(`[Storage] Intento de guardar array vacío en key "${key}"`);
    return; // Mantiene datos anteriores
  }

  await this.nativeStorege.setItem(key, value);
}
```

---

### 2. Promise.allSettled para Descargas Robustas
**Archivo:** `src/app/imisa-services/file-updates.service.ts`
**Líneas:** 28-100

**Cambio:**
- Cada descarga tiene su propio `.catch()` individual
- Usa `Promise.allSettled()` para que si una falla, las demás continúen
- Registra en consola cuántas descargas tuvieron éxito
- Actualiza timestamp si al menos UNA descarga tuvo éxito

**Antes:**
```typescript
await Promise.all(dataFetchPromises); // Si UNA falla, TODAS se rechazan
```

**Ahora:**
```typescript
const results = await Promise.allSettled(dataFetchPromises);
const successful = results.filter(r => r.status === 'fulfilled').length;
console.log(`[Sync] ${successful} exitosas de ${results.length} total`);

if (successful > 0) {
  await this.commonService.setLastSyncDate(); // Actualizar timestamp
}
```

---

### 3. Sistema de Timestamp y Auto-sync Inteligente
**Archivo:** `src/app/imisa-services/common.service.ts`

**Nuevas constantes:**
```typescript
public readonly LAST_SYNC_DATE = "LAST_SYNC_DATE";
public readonly AUTO_SYNC_DAYS = 7; // Configurable
```

**Nuevos métodos:**
- `getLastSyncDate()`: Obtiene fecha de última sincronización exitosa
- `setLastSyncDate()`: Guarda fecha de última sincronización
- `shouldAutoSync()`: Retorna `true` si han pasado ≥7 días desde última sync

```typescript
public async shouldAutoSync(): Promise<boolean> {
  const lastSync = await this.getLastSyncDate();

  if (!lastSync) {
    return false; // No forzar si nunca se ha sincronizado
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= this.AUTO_SYNC_DAYS;
}
```

---

### 4. Re-descarga Condicional en submitOrder
**Archivo:** `src/app/home/home.page.ts`
**Líneas:** 125-147

**Antes (PROBLEMÁTICO):**
```typescript
await this.fileUpdatesService.fetchAndSaveAllFiles(); // SIEMPRE, sin manejo de errores
```

**Ahora (SEGURO):**
```typescript
const shouldSync = await this.commonService.shouldAutoSync();
let syncMessage = "";

if (shouldSync) {  // Solo si han pasado ≥7 días
  try {
    const syncSuccess = await this.fileUpdatesService.fetchAndSaveAllFiles(false);
    if (syncSuccess) {
      syncMessage = " Die Daten wurden aktualisiert.";
    } else {
      syncMessage = " (Warnung: Datenaktualisierung fehlgeschlagen, vorherige Daten beibehalten)";
    }
  } catch (error) {
    console.error("[Home] Error en auto-sync:", error);
    syncMessage = " (Warnung: Datenaktualisierung fehlgeschlagen, vorherige Daten beibehalten)";
  }
}

await this.commonService.showAlertMessage(
  `Der Auftrag wurde erfolgreich übermittelt.${syncMessage}`,
  "iMisa"
);
```

---

## Nuevo Comportamiento

### Escenario 1: Usuario envía pedido (Días 1-6 desde última sync)
```
1. Pedido se envía OK ✅
2. shouldAutoSync() → false (no han pasado 7 días)
3. NO re-descarga datos 🚫
4. Mensaje: "Pedido enviado y guardado"
5. Datos locales INTACTOS
```

### Escenario 2: Usuario envía pedido (Día 7+ desde última sync)
```
1. Pedido se envía OK ✅
2. shouldAutoSync() → true (≥7 días)
3. Intenta re-descarga automática
4a. Si OK → "Pedido enviado. Datos actualizados." ✅
4b. Si FALLA → "Pedido enviado (actualización falló, datos anteriores mantenidos)" ⚠️
5. Datos anteriores SIEMPRE protegidos
```

### Escenario 3: API falla temporalmente
```
1. Intenta descargar
2. API timeout/error ❌
3. setNativeValue recibe null → NO sobrescribe ✅
4. Datos anteriores INTACTOS
5. Usuario puede seguir trabajando
```

---

## Configuración

### Cambiar días entre sincronizaciones automáticas

**Archivo:** `src/app/imisa-services/common.service.ts:30`

```typescript
public readonly AUTO_SYNC_DAYS = 7; // Cambiar a 3, 14, 30, etc.
```

**Valores recomendados:**
- `3` = Sincronización frecuente (cada 3 días)
- `7` = Semanal (recomendado)
- `14` = Quincenal
- `30` = Mensual

---

## Archivos Modificados

1. ✅ `src/app/imisa-services/nativestorage.service.ts` - Protección de datos
2. ✅ `src/app/imisa-services/file-updates.service.ts` - Promise.allSettled + logging
3. ✅ `src/app/imisa-services/common.service.ts` - Sistema de timestamp
4. ✅ `src/app/home/home.page.ts` - Re-descarga condicional

---

## Testing Recomendado

### Test 1: Primera descarga
1. App nueva sin datos
2. Enviar pedido → Debe descargar datos iniciales
3. Verificar que se guardó `LAST_SYNC_DATE`

### Test 2: Envío de pedido (< 7 días)
1. Enviar pedido 1 día después de la primera descarga
2. Verificar que NO re-descarga
3. Mensaje debe decir solo "Pedido enviado"

### Test 3: Auto-sync después de 7 días
1. Cambiar manualmente fecha de última sync a hace 8 días (en storage)
2. Enviar pedido
3. Debe intentar re-descarga automática
4. Mensaje debe incluir "Datos actualizados"

### Test 4: Fallo de API con datos existentes
1. Desconectar red o apagar servidor
2. Cambiar fecha de última sync a hace 8 días
3. Enviar pedido
4. Debe mostrar warning pero mantener datos anteriores
5. Verificar que puede seguir entrando a materialbeschaffung

### Test 5: Descarga parcialmente exitosa
1. Configurar servidor para que solo `products` falle
2. Forzar sincronización
3. Verificar en consola: "4 exitosas, 1 fallida de 5 total"
4. Verificar que `products` mantiene datos anteriores
5. Verificar que otros datos SÍ se actualizaron

---

## Logs en Consola

Con los cambios, ahora verás logs como:

```
[Storage] Intento de guardar array vacío en key "products". Se mantienen datos anteriores.
[Sync] Error descargando products: TypeError: Network request failed
[Sync] Resultado: 4 exitosas, 1 fallidas de 5 total
[Home] Auto-sync activado, descargando actualizaciones...
```

---

## Beneficios

✅ **No más pérdida de datos** - Datos anteriores se protegen siempre
✅ **Menos tráfico de red** - Solo sincroniza cuando es necesario
✅ **Mejor experiencia offline** - Funciona con datos locales sin problemas
✅ **Mensajes informativos** - Usuario sabe si la sincronización falló
✅ **Descargas robustas** - Fallos parciales no afectan todo
✅ **Configurable** - Ajustar días de sincronización fácilmente

---

## Rollback (Si es necesario)

Si necesitas volver al comportamiento anterior:

1. Revertir commit:
```bash
git log --oneline  # Ver commit ID
git revert <commit-id>
```

2. O restaurar archivos individuales:
```bash
git checkout HEAD~1 src/app/home/home.page.ts
git checkout HEAD~1 src/app/imisa-services/file-updates.service.ts
git checkout HEAD~1 src/app/imisa-services/nativestorage.service.ts
git checkout HEAD~1 src/app/imisa-services/common.service.ts
```

---

**Autor:** Claude Code
**Fecha implementación:** 2025-11-27
