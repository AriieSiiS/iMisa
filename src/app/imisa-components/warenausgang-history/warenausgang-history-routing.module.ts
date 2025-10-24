import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WarenausgangHistoryPage } from './warenausgang-history.page';

const routes: Routes = [
  {
    path: '',
    component: WarenausgangHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarenausgangHistoryPageRoutingModule {}
