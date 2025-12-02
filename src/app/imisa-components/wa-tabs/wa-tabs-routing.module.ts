import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WaTabsPage } from "./wa-tabs.page";

const routes: Routes = [
  {
    path: "",
    component: WaTabsPage,
    children: [
      {
        path: "order",
        loadChildren: () =>
          import("../warenausgang/warenausgang.module").then(
            (m) => m.WarenausgangPageModule
          ),
      },
      {
        path: "articals",
        loadChildren: () =>
          import("../articals/articals.module").then(
            (m) => m.ArticalsPageModule
          ),
      },
      {
        path: "artical-list",
        loadChildren: () =>
          import("../artical-list/artical-list.module").then(
            (m) => m.ArticalListPageModule
          ),
      },
      {
        path: "history",
        loadChildren: () =>
          import("../warenausgang-history/warenausgang-history.module").then(
            (m) => m.WarenausgangHistoryPageModule
          ),
      },
      {
        path: "settings",
        loadChildren: () =>
          import("../app-settings/app-settings.module").then(
            (m) => m.AppSettingsPageModule
          ),
      },
      {
        path: "articals",
        loadChildren: () =>
          import("../articals/articals.module").then(
            (m) => m.ArticalsPageModule
          ),
      },
      { path: "", redirectTo: "order", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaTabsPageRoutingModule {}
