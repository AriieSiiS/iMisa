import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryTransferPage } from './inventory-transfer.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryTransferPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryTransferPageRoutingModule {}
