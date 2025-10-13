import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WarenausgangPage } from './warenausgang.page';

const routes: Routes = [
  {
    path: '',
    component: WarenausgangPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarenausgangPageRoutingModule {}
