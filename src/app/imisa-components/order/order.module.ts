import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { OrderPage } from "./order.page";
import { ComponentsModule } from "../components.modules";

const routes: Routes = [
  {
    path: "",
    component: OrderPage,
  }, //,
  // {
  //   path: 'edit',
  //   loadChildren: '../item-edit/item-edit.module#ItemEditPageModule'
  // },
  {
    path: "edit-order",
    loadChildren: () =>
      import("../item-edit/item-edit.module").then((m) => m.ItemEditPageModule),
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [OrderPage],
})
export class OrderPageModule {}
