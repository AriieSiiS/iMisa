import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderHistoryDetailPage } from './order-history-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OrderHistoryDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderHistoryDetailPageRoutingModule {}
