import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "tabs",
    loadChildren: () =>
      import("./imisa-components/tabs/tabs.module").then(
        (m) => m.TabsPageModule
      ),
  },
  { path: "", redirectTo: "home", pathMatch: "full" },
  {
    path: "home",
    loadChildren: () =>
      import("./home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: "",
    loadChildren: () =>
      import("./imisa-components/tabs/tabs.module").then(
        (m) => m.TabsPageModule
      ),
  },
  // { path: 'articals', loadChildren: './imisa-components/articals/articals.module#ArticalsPageModule' },
  // { path: 'artical-list', loadChildren: './imisa-components/artical-list/artical-list.module#ArticalListPageModule' },
  {
    path: "item-edit",
    loadChildren: () =>
      import("./imisa-components/item-edit/item-edit.module").then(
        (m) => m.ItemEditPageModule
      ),
  },
  {
    path: "app-settings",
    loadChildren: () =>
      import("./imisa-components/app-settings/app-settings.module").then(
        (m) => m.AppSettingsPageModule
      ),
  },
  {
    path: "inventory-transfer",
    loadChildren: () =>
      import(
        "./imisa-components/inventory-transfer/inventory-transfer.module"
      ).then((m) => m.InventoryTransferPageModule),
  },
  {
    path: "inventory",
    loadChildren: () =>
      import("./imisa-components/inventory/inventory.module").then(
        (m) => m.InventoryPageModule
      ),
  },
  {
    path: "warenausgang",
    loadChildren: () =>
      import("./imisa-components/warenausgang/warenausgang.module").then(
        (m) => m.WarenausgangPageModule
      ),
  },  {
    path: 'inventory-transfer',
    loadChildren: () => import('./imisa-components/inventory-transfer/inventory-transfer.module').then( m => m.InventoryTransferPageModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./imisa-components/inventory/inventory.module').then( m => m.InventoryPageModule)
  },
  {
    path: 'warenausgang',
    loadChildren: () => import('./imisa-components/warenausgang/warenausgang.module').then( m => m.WarenausgangPageModule)
  },


  // { path: 'articals-list-edit', loadChildren: './imisa-components/articals-list/articals-list.module#ArticalsListPageModule' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
