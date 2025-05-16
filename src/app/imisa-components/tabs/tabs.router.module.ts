import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    children: [
      {
        path: "order",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../order/order.module").then((m) => m.OrderPageModule),
          },
        ],
      },
      {
        path: "orderhistory",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../order-history/order-history.module").then(
                (m) => m.OrderHistoryPageModule
              ),
          },
          {
            path: "order-history-detail",
            loadChildren: () =>
              import(
                "../order-history/order-history-detail/order-history-detail.module"
              ).then((m) => m.OrderHistoryDetailPageModule),
          },
        ],
      },

      {
        path: "settings",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../settings/settings.module").then(
                (m) => m.SettingsPageModule
              ),
          },
        ],
      },
      {
        path: "articals",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../articals/articals.module").then(
                (m) => m.ArticalsPageModule
              ),
          },
          // ,
          // {
          //   path: ':id',
          //   loadChildren: '../artical-list/artical-list.module#ArticalListPageModule',
          // }
        ],
      },
      // {
      //   path: 'articals/:id',
      //   children: [{
      //     path: '',
      //     loadChildren: '../artical-list/artical-list.module#ArticalListPageModule',
      //   }]
      // },
      {
        path: "edit",
        loadChildren: () =>
          import("../item-edit/item-edit.module").then(
            (m) => m.ItemEditPageModule
          ),
      },
      {
        path: "",
        redirectTo: "/tabs/order",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    redirectTo: "/tabs/order",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
