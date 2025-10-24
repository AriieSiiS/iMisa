import { Injectable } from "@angular/core";
import { NativestorageService } from "./nativestorage.service";
import { WarenausgangHistoryEntry } from "../models/wa-history";

@Injectable({ providedIn: "root" })
export class WaHistoryService {
  private readonly KEY = "wa_history";

  constructor(private native: NativestorageService) {}

  private async readAll(): Promise<WarenausgangHistoryEntry[]> {
    const arr = (await this.native.getNativeValue(this.KEY)) || [];
    return Array.isArray(arr) ? arr : [];
  }

  private async writeAll(items: WarenausgangHistoryEntry[]): Promise<void> {
    await this.native.setNativeValue(this.KEY, items);
  }

  async list(): Promise<WarenausgangHistoryEntry[]> {
    const all = await this.readAll();
    // más reciente primero
    return all.sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1));
  }

  async add(entry: WarenausgangHistoryEntry): Promise<void> {
    const all = await this.readAll();
    all.push(entry);
    await this.writeAll(all);
  }

  async getById(id: string): Promise<WarenausgangHistoryEntry | null> {
    const all = await this.readAll();
    return all.find((x) => x.id === id) ?? null;
  }

  async clear(): Promise<void> {
    await this.writeAll([]);
  }
}
