import { Component, OnInit } from "@angular/core";
import { WaHistoryService } from "../../imisa-services/wa-history.service";
import { WarenausgangHistoryEntry } from "../../models/wa-history";

@Component({
  selector: "app-warenausgang-history",
  templateUrl: "./warenausgang-history.page.html",
  styleUrls: ["./warenausgang-history.page.scss"],
  standalone: false,
})
export class WarenausgangHistoryPage implements OnInit {
  items: WarenausgangHistoryEntry[] = [];
  selectedId: string | null = null;

  constructor(private history: WaHistoryService) {}

  async ngOnInit() {
    await this.reload();
  }

  async ionViewWillEnter() {
    await this.reload();
  }

  async reload() {
    this.items = await this.history.list();
    if (this.items.length > 0 && !this.selectedId) {
      this.selectedId = this.items[0].id;
    }
  }

  select(id: string) {
    this.selectedId = this.selectedId === id ? null : id;
  }

  trackById(_: number, it: WarenausgangHistoryEntry) {
    return it.id;
  }

  getSelected() {
    if (!this.selectedId) return null;
    return this.items.find((x) => x.id === this.selectedId) ?? null;
  }

  async clearHistory() {
    await this.history.clear();
    await this.reload();
  }
}
