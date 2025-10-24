import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaTabsPageRoutingModule } from './wa-tabs-routing.module';

import { WaTabsPage } from './wa-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaTabsPageRoutingModule
  ],
  declarations: [WaTabsPage]
})
export class WaTabsPageModule {}
