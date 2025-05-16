import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderHistoryPage } from './order-history.page';
import { ComponentsModule } from '../components.modules';


const routes: Routes = [
  {
    path: '',
    component: OrderHistoryPage
  }
  ,{
    path: 'order-history',
    loadChildren: () => import('../order/order.module').then(m => m.OrderPageModule)

  },
  {
    path: 'edit-order',
    loadChildren: () => import('../item-edit/item-edit.module').then(m => m.ItemEditPageModule)
  }

  
  // ,{
  //   path: 'edit-order-history',
  //   loadChildren: '../item-edit/item-edit.module#ItemEditPageModule'
  // },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OrderHistoryPage]
})
export class OrderHistoryPageModule {}
