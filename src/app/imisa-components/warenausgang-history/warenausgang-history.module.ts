import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarenausgangHistoryPageRoutingModule } from './warenausgang-history-routing.module';

import { WarenausgangHistoryPage } from './warenausgang-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WarenausgangHistoryPageRoutingModule
  ],
  declarations: [WarenausgangHistoryPage]
})
export class WarenausgangHistoryPageModule {}
